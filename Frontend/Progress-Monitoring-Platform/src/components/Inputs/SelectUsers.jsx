import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../Modal';
import { LuUsers } from 'react-icons/lu';
import AvatarGroup from '../AvatarGroup';

const SelectUsers = (props) => {
    const {
        // controlled select props
        name,
        value,
        onChange,
        className,
        disabled,
        users: externalUsers,  // Accept users from props
        children,

        // legacy modal props
        selectedUsers = [],
        setSelectedUsers,
    } = props;

    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            // Only fetch users if not provided via props
            if (!externalUsers) {
                const response = await axiosInstance.get(API_PATHS.USERS.GET_USERS_FOR_ASSIGNMENT);
                // The new endpoint should return an array of users directly
                const users = Array.isArray(response.data) ? response.data : [];
                setAllUsers(users);
            }
        } catch (error) {
            console.error('Error fetching users for assignment:', error);
            // Fallback to empty array to prevent errors
            setAllUsers([]);
        }
    };

    useEffect(() => {
        if (!externalUsers) {
            getAllUsers();
        }
    }, [externalUsers]);

    // Use externalUsers if provided, otherwise use internal allUsers state
    const displayUsers = externalUsers ? 
        (Array.isArray(externalUsers) ? externalUsers : []) : 
        allUsers;

    // Helper function to compare arrays
    const arraysEqual = (a, b) => {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;
        return a.every((val, i) => val === b[i]);
    };

    const prevSelectedUsersRef = useRef();

    useEffect(() => {
        // Only update if selectedUsers has actually changed
        if (!arraysEqual(prevSelectedUsersRef.current, selectedUsers)) {
            setTempSelectedUsers([...selectedUsers]);
            prevSelectedUsersRef.current = selectedUsers;
        }
    }, [selectedUsers]);

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers((prev) => {
            const newSelection = prev.includes(userId) 
                ? prev.filter((id) => id !== userId) 
                : [...prev, userId];
            return newSelection;
        });
    };

    const handleAssign = () => {
        if (typeof setSelectedUsers === 'function') {
            setSelectedUsers(tempSelectedUsers);
        }
        setIsModalOpen(false);
    };

    // Build avatar list for display (legacy modal)
    const selectedUsersAvatars = (selectedUsers || [])
        .map((id) => displayUsers.find((u) => u._id === id))
        .filter(Boolean)
        .map((u) => u.profileImageUrl || '');

    // If used as a controlled select (CreateTask), render a <select>
    if (onChange && name !== undefined) {
        return (
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={className}
                disabled={disabled}
            >
                {children}
                {/* fallback: if no children provided, render users */}
                {(!children || React.Children.count(children) === 0) && (
                    <>
                        <option value="">Unassigned</option>
                        {displayUsers.map((user) => (
                            <option key={user._id} value={user._id}>
                                {user.name}
                            </option>
                        ))}
                    </>
                )}
            </select>
        );
    }

    // Otherwise render the legacy modal multi-select UI
    return (
        <div className="space-y-4 mt-2">
            {selectedUsersAvatars.length === 0 ? (
                <button type="button" className="card-btn" onClick={() => setIsModalOpen(true)}>
                    <LuUsers className="text-sm" /> Add members
                </button>
            ) : (
                <div className="flex items-center gap-3">
                    <button type="button" className="card-btn" onClick={() => setIsModalOpen(true)}>
                        <LuUsers className="text-sm" /> Add members
                    </button>
                    <div className="cursor-pointer" onClick={() => setIsModalOpen(true)}>
                        <AvatarGroup avatars={selectedUsersAvatars} maxvisible={3} />
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select Users to Assign">
                <div className="space-y-4 h-[60vh] overflow-y-auto">
                    {displayUsers.map((user) => (
                        <div key={user._id} className="flex items-center gap-4 p-3 border-b border-gray-200">
                            <img 
                                src={user.profileImageUrl} 
                                alt={user.name} 
                                className="w-8 h-8 rounded-full object-cover" 
                                onError={(e) => {
                                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'U');
                                }}
                            />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{user.name}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={tempSelectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setTempSelectedUsers([...selectedUsers]);
                            setIsModalOpen(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                        Assign
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SelectUsers;
import React, { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Create the context
export const UsersContext = createContext();

// Create a separate hook for using the context
export function useUsersContext() {
  const context = React.useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsersContext must be used within a UsersProvider');
  }
  return context;
}

export const UsersProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch all users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== USERS CONTEXT DEBUG ===');
      console.log('Fetching users from API...');
      console.log('API endpoint:', API_PATHS.USERS.GET_ALL_USERS);
      
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      console.log('API response:', response.data);
      console.log('Response structure:', Object.keys(response.data));
      console.log('Response data:', response.data.data);
      
      const usersData = response.data.data || [];
      console.log('Users data length:', usersData.length);
      console.log('Users data:', usersData);
      
      const formattedUsers = usersData.map(user => ({
        id: user._id || user.id,
        _id: user._id || user.id,
        email: user.email,
        role: user.role,
        name: user.name || 'No Name',
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt,
        // Preserve task count fields from backend
        pendingTasks: user.pendingTasks || 0,
        inProgressTasks: user.inProgressTasks || 0,
        completedTasks: user.completedTasks || 0,
        // Initialize assignedTasks as empty array (will be populated when needed)
        assignedTasks: []
      }));
      
      console.log('Formatted users:', formattedUsers);
      console.log('=== END USERS CONTEXT DEBUG ===');
      
      setUsers(formattedUsers);
      return formattedUsers;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch users for assignment (members only)
  const fetchUsersForAssignment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_USERS_FOR_ASSIGNMENT);
      const usersData = Array.isArray(response.data) ? response.data : [];
      
      const formattedUsers = usersData.map(user => ({
        id: user._id || user.id,
        _id: user._id || user.id,
        email: user.email,
        role: user.role,
        name: user.name || 'No Name',
        profileImageUrl: user.profileImageUrl,
        createdAt: user.createdAt
      }));
      
      setUsers(formattedUsers);
      return formattedUsers;
    } catch (error) {
      console.error('Failed to fetch users for assignment:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to update a specific user in the users array
  const updateUserInList = useCallback((updatedUser) => {
    if (!updatedUser || !updatedUser._id) return;
    
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === updatedUser._id || user.id === updatedUser._id
          ? { ...user, ...updatedUser }
          : user
      )
    );
  }, []);

  // Function to add a new user to the list
  const addUserToList = useCallback((newUser) => {
    if (!newUser || !newUser._id) return;
    
    setUsers(prevUsers => {
      const formattedUser = {
        id: newUser._id,
        _id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name || 'No Name',
        profileImageUrl: newUser.profileImageUrl,
        createdAt: newUser.createdAt || new Date().toISOString(),
        // Initialize task count fields
        pendingTasks: newUser.pendingTasks || 0,
        inProgressTasks: newUser.inProgressTasks || 0,
        completedTasks: newUser.completedTasks || 0,
        // Initialize assignedTasks as empty array
        assignedTasks: []
      };
      
      // Check if user already exists
      const existingIndex = prevUsers.findIndex(u => u._id === newUser._id || u.id === newUser._id);
      if (existingIndex >= 0) {
        // Update existing user
        const updatedUsers = [...prevUsers];
        updatedUsers[existingIndex] = formattedUser;
        return updatedUsers;
      } else {
        // Add new user
        return [...prevUsers, formattedUser];
      }
    });
  }, []);

  // Function to remove a user from the list
  const removeUserFromList = useCallback((userId) => {
    if (!userId) return;
    
    setUsers(prevUsers => 
      prevUsers.filter(user => user._id !== userId && user.id !== userId)
    );
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    users,
    loading,
    error,
    fetchUsers,
    fetchUsersForAssignment,
    updateUserInList,
    addUserToList,
    removeUserFromList
  };

  return (
    <UsersContext.Provider value={contextValue}>
      {children}
    </UsersContext.Provider>
  );
};

// Export the hook that uses the context
export { useUsersContext as useUsers };

// Default export the provider
export default UsersProvider;

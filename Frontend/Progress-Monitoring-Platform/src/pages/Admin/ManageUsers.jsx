import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiRefreshCw, FiBriefcase, FiX } from 'react-icons/fi';
import { useUsers } from '../../context/usersContext';

const ManageUsers = () => {
  const { users: allUsers, loading, fetchUsers: refreshUsers, removeUserFromList } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('member'); // Default to member role
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  
  // Debug logging
  console.log('=== MANAGE USERS COMPONENT DEBUG ===');
  console.log('All users from context:', allUsers);
  console.log('Loading state:', loading);
  console.log('All users length:', allUsers.length);
  console.log('=== END MANAGE USERS DEBUG ===');
  
  // Task assignment states
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Filter users to show only members (case-insensitive check)
  const users = allUsers.filter(user => {
    console.log('=== MANAGE USERS FILTER DEBUG ===');
    console.log('User:', user);
    console.log('User role:', user.role);
    console.log('User role type:', typeof user.role);
    console.log('Is member:', user.role && user.role.toLowerCase() === 'member');
    console.log('=== END FILTER DEBUG ===');
    
    const isMember = user.role && user.role.toLowerCase() === 'member';
    return isMember;
  });

  // Update totalPages when users change
  useEffect(() => {
    setTotalPages(Math.ceil(users.length / 10) || 1);
  }, [users]);

  // Fetch all tasks for assignment
  const fetchAllTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      setAllTasks(response.data?.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  // Open task assignment modal
  const handleAssignTask = (user) => {
    setSelectedUser(user);
    setSelectedTasks(user.assignedTasks?.map(task => task._id) || []);
    setShowAssignTaskModal(true);
    fetchAllTasks();
  };

  // Toggle task selection
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Save task assignments
  const saveTaskAssignments = async () => {
    try {
      // Validation checks
      if (!selectedUser) {
        toast.error('No user selected for assignment');
        return;
      }
      
      if (!selectedTasks || selectedTasks.length === 0) {
        toast.error('No tasks selected for assignment');
        return;
      }
      
      console.log('=== STARTING TASK ASSIGNMENT ===');
      console.log('Assigning tasks:', selectedTasks);
      console.log('To user:', selectedUser);
      
      // Show loading state
      const loadingToast = toast.loading('Assigning tasks...');
      
      // Update each task with the assigned user
      for (const taskId of selectedTasks) {
        console.log('--- Processing task:', taskId, '---');
        console.log('Selected user object:', selectedUser);
        
        // Backend expects assignedTo to be a single ObjectId string, not an array
        const assignmentData = {
          assignedTo: selectedUser._id // Send just the user ID as a string
        };
        
        // Enhanced debugging - check what we're actually sending
        console.log('=== ASSIGNMENT DEBUG ===');
        console.log('Task ID:', taskId);
        console.log('Selected User ID:', selectedUser._id);
        console.log('Selected User ID type:', typeof selectedUser._id);
        console.log('Assignment Data:', JSON.stringify(assignmentData, null, 2));
        console.log('API Endpoint:', API_PATHS.TASKS.UPDATE_TASK(taskId));
        console.log('Full API URL:', `http://localhost:8000${API_PATHS.TASKS.UPDATE_TASK(taskId)}`);
        console.log('=== END ASSIGNMENT DEBUG ===');
        
        console.log('Sending assignment data:', assignmentData);
        console.log('API endpoint:', API_PATHS.TASKS.UPDATE_TASK(taskId));
        
        try {
          const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskId), assignmentData);
          
          console.log('Task update response:', response);
          console.log('Task update response status:', response.status);
          console.log('Task update response data:', response.data);
          console.log('Task update response data.success:', response.data?.success);
          console.log('Task update response data.data:', response.data?.data);
          
          // Check if the task was actually updated with the assignment
          if (response.data?.data) {
            const updatedTask = response.data.data;
            console.log('=== ASSIGNMENT VERIFICATION ===');
            console.log('Updated task assignedTo field:', updatedTask.assignedTo);
            console.log('Expected assignedTo value:', selectedUser._id);
            console.log('Assignment match:', updatedTask.assignedTo === selectedUser._id);
            console.log('Full updated task:', JSON.stringify(updatedTask, null, 2));
            console.log('=== END ASSIGNMENT VERIFICATION ===');
          } else {
            console.log('=== NO TASK DATA IN RESPONSE ===');
            console.log('Response data:', response.data);
            console.log('Response data keys:', Object.keys(response.data || {}));
            console.log('=== END NO TASK DATA ===');
          }
          
        } catch (taskError) {
          console.error('Error updating individual task:', taskError);
          console.error('Task error response:', taskError.response);
          console.error('Task error response data:', JSON.stringify(taskError.response?.data, null, 2));
          console.error('Task error response status:', taskError.response?.status);
          throw taskError;
        }
        
        console.log('Task updated successfully');
      }
      
      // Update loading toast to success
      toast.success(`Successfully assigned ${selectedTasks.length} task(s) to ${selectedUser.name}`, {
        id: loadingToast
      });
      
      // Close modal and refresh data
      setShowAssignTaskModal(false);
      refreshUsers();
      
      // Also refresh the tasks in ManageTasks by triggering a re-fetch
      // This will ensure the task list shows updated assignments
      console.log('Triggering tasksUpdated event...');
      setTimeout(() => {
        console.log('=== DISPATCHING TASKS UPDATED EVENT ===');
        window.dispatchEvent(new Event('tasksUpdated'));
        console.log('=== TASKS UPDATED EVENT DISPATCHED ===');
      }, 500);
      
      console.log('=== TASK ASSIGNMENT COMPLETED ===');
      
    } catch (error) {
      console.error('=== TASK ASSIGNMENT FAILED ===');
      console.error('Error assigning tasks:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to assign tasks. Please try again.';
      
      toast.error(errorMessage);
    }
  };

  const fetchUsers = async () => {
    try {
      // setLoading is handled by useUsers context
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please log in to view users');
        navigate('/login', { state: { from: '/admin/users' } });
        return;
      }

      console.log('Fetching users via context...');
      refreshUsers();
      
      if (users.length === 0) {
        console.warn('No member users found. All users:', allUsers);
        toast('No member users found', { icon: 'ℹ️' });
      }
      
            setTotalPages(Math.ceil(memberUsers.length / 10) || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 403) {
          toast.error('You do not have permission to view users');
        } else if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login', { state: { from: '/admin/users' } });
        } else {
          toast.error(error.response.data?.message || 'Failed to load users');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request
        console.error('Request error:', error.message);
        toast.error(error.message || 'Failed to load users');
      }
    } finally {
      // setLoading is handled by useUsers context
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userId));
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Manage Users</h2>
        <button
          onClick={() => navigate('/admin/users/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New User
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Showing: Members</span>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiRefreshCw className="mr-2" />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Tasks
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {(user.pendingTasks || 0) + (user.inProgressTasks || 0) + (user.completedTasks || 0)} tasks
                        </span>
                        <button
                          onClick={() => handleAssignTask(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Assign tasks"
                        >
                          <FiBriefcase className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * 10, totalPages * 10)}</span> of{' '}
                  <span className="font-medium">{totalPages * 10}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`${currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Assignment Modal */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Tasks to {selectedUser?.name}
                </h3>
                <button
                  onClick={() => setShowAssignTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {allTasks.length > 0 ? (
                      allTasks.map((task) => (
                        <div key={task._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`task-${task._id}`}
                            checked={selectedTasks.includes(task._id)}
                            onChange={() => toggleTaskSelection(task._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`task-${task._id}`} className="ml-3 flex-1 cursor-pointer">
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-xs text-gray-500">
                              Status: {task.status} | Priority: {task.priority}
                            </div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tasks available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Assignment Summary */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Selected <span className="font-semibold text-blue-600">{selectedTasks.length}</span> task(s) to assign to <span className="font-semibold text-blue-600">{selectedUser?.name}</span>
                  </div>
                  {selectedTasks.length > 0 && (
                    <button
                      onClick={() => setSelectedTasks([])}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAssignTaskModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTaskAssignments}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Assignments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

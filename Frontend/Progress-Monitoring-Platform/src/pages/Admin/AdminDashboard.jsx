// src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { useUsers } from '../../context/usersContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { FiClipboard, FiClock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiUserPlus, FiX } from 'react-icons/fi';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const { users } = useUsers();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock tasks from ManageTasks - same as ManageTasks component
  const mockTasks = [
    { 
      _id: '653af7fdb3aab8a6b8e5d5b1', 
      title: 'Resume Writing', 
      priority: 'medium', 
      status: 'pending', 
      dueDate: '2025-12-12',
      description: 'make your resume and send in the due time',
      progress: 0,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b2', name: 'Test User', email: 'test@example.com' }],
      createdAt: '2025-11-20T10:30:00Z'
    },
    { 
      _id: '653af7fdb3aab8a6b8e5d5b3', 
      title: 'Database optimization', 
      priority: 'medium', 
      status: 'pending', 
      dueDate: '2025-12-18',
      description: 'Optimize database queries for better performance',
      progress: 0,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b4', name: 'Mohit', email: 'mohit@example.com' }],
      createdAt: '2025-11-22T14:15:00Z'
    },
    { 
      _id: '653af7fdb3aab8a6b8e5d5b5', 
      title: 'Implement search functionality', 
      priority: 'high', 
      status: 'in-progress', 
      dueDate: '2025-12-20',
      description: 'Add search feature to the task management system',
      progress: 45,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b6', name: 'Manpreet', email: 'manpreet@example.com' }],
      createdAt: '2025-11-24T09:45:00Z'
    },
    { 
      _id: '653af7fdb3aab8a6b8e5d5b7', 
      title: 'Update user documentation', 
      priority: 'low', 
      status: 'completed', 
      dueDate: '2025-12-10',
      description: 'Update the user guide with new features',
      progress: 100,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b8', name: 'Manpreet', email: 'manpreet@example.com' }],
      completedAt: '2025-12-08T16:20:00Z',
      createdAt: '2025-11-15T11:10:00Z'
    },
    { 
      _id: '653af7fdb3aab8a6b8e5d5b9', 
      title: 'Fix navigation bug', 
      priority: 'medium', 
      status: 'pending', 
      dueDate: '2025-12-12',
      description: 'Resolve the navigation menu issue on mobile devices',
      progress: 0,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b2', name: 'Test User', email: 'test@example.com' }],
      createdAt: '2025-11-18T13:25:00Z'
    },
    { 
      _id: '653af7fdb3aab8a6b8e5d5c0', 
      title: 'Design new landing page', 
      priority: 'high', 
      status: 'in-progress', 
      dueDate: '2025-12-15',
      description: 'Create a modern, responsive landing page design',
      progress: 60,
      assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b2', name: 'Test User', email: 'test@example.com' }],
      createdAt: '2025-11-26T10:15:00Z'
    }
  ];

  // Task assignment states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [assigningTask, setAssigningTask] = useState(false);

  // Fetch dashboard data - moved outside useEffect to be accessible to event listener
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('=== ADMIN DASHBOARD FETCHING DATA ===');
      
      // Fetch all tasks (same as ManageTasks)
      const tasksResponse = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      console.log('AdminDashboard tasks response:', tasksResponse.data);
      
      let allTasks = [];
      
      // Handle different response structures (consistent with ManageTasks)
      if (tasksResponse.data && tasksResponse.data.tasks) {
        allTasks = tasksResponse.data.tasks;
        console.log('Using response.data.tasks:', allTasks);
      } else if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
        allTasks = tasksResponse.data;
        console.log('Using response.data as array:', allTasks);
      } else if (tasksResponse.data && tasksResponse.data.data && Array.isArray(tasksResponse.data.data)) {
        allTasks = tasksResponse.data.data;
        console.log('Using response.data.data as array:', allTasks);
      } else {
        console.log('Unexpected response structure, using empty array');
        console.log('Full response keys:', Object.keys(tasksResponse.data || {}));
        allTasks = [];
      }
      
      console.log('AdminDashboard final tasks array:', allTasks);
      
      // Calculate stats from actual tasks data (consistent with ManageTasks)
      const statusCounts = allTasks.reduce((acc, task) => {
        acc.total++;
        // Handle both "In Progress" and "in-progress" status formats
        if (task.status === 'Pending' || task.status === 'pending') acc.pending++;
        else if (task.status === 'In Progress' || task.status === 'in-progress') acc.inProgress++;
        else if (task.status === 'Completed' || task.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, pending: 0, inProgress: 0, completed: 0 });
      
      console.log('AdminDashboard status counts:', statusCounts);
      
      setStats({
        totalTasks: statusCounts.total,
        pendingTasks: statusCounts.pending,
        inProgressTasks: statusCounts.inProgress,
        completedTasks: statusCounts.completed
      });
      
      // Set recent tasks (show only 5 most recent, sorted by creation date)
      const sortedTasks = allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentTasksSlice = sortedTasks.slice(0, 5);
      console.log('AdminDashboard recent tasks:', recentTasksSlice);
      setRecentTasks(recentTasksSlice);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.log('Using mock data as fallback, same as ManageTasks');
      
      // Use mock tasks as fallback (same as ManageTasks)
      const tasks = [...mockTasks];
      
      // Calculate stats from mock tasks
      const statusCounts = tasks.reduce((acc, task) => {
        acc.total++;
        // Handle both "In Progress" and "in-progress" status formats
        if (task.status === 'Pending' || task.status === 'pending') acc.pending++;
        else if (task.status === 'In Progress' || task.status === 'in-progress') acc.inProgress++;
        else if (task.status === 'Completed' || task.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, pending: 0, inProgress: 0, completed: 0 });
      
      setStats({
        totalTasks: statusCounts.total,
        pendingTasks: statusCounts.pending,
        inProgressTasks: statusCounts.inProgress,
        completedTasks: statusCounts.completed
      });
      
      // Set recent tasks from mock data (show only 5 most recent, sorted by creation date)
      const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentTasksSlice = sortedTasks.slice(0, 5);
      setRecentTasks(recentTasksSlice);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for task updates from other components
  useEffect(() => {
    const handleTasksUpdated = () => {
      console.log('=== TASKS UPDATED EVENT RECEIVED IN ADMIN DASHBOARD ===');
      console.log('Tasks updated event received, refreshing dashboard data...');
      fetchDashboardData();
    };

    console.log('Setting up tasksUpdated event listener in AdminDashboard');
    window.addEventListener('tasksUpdated', handleTasksUpdated);
    
    return () => {
      console.log('Cleaning up tasksUpdated event listener in AdminDashboard');
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, [fetchDashboardData]);

  // Fetch dashboard data on component mount
  useEffect(() => {
    console.log('=== ADMIN DASHBOARD COMPONENT MOUNTED ===');
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Task assignment functions
  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setSelectedUser('');
    setShowAssignModal(true);
  };

  // Demo function to assign an existing task to a real user
  const handleAssignExistingTaskToUser = async () => {
    try {
      console.log('Looking for existing unassigned tasks...');
      console.log('Available users:', users);
      
      // Find member users (not admins)
      const memberUsers = users.filter(user => user.role === 'member');
      console.log('Available member users:', memberUsers);
      
      if (memberUsers.length === 0) {
        alert('No member users available for assignment. Please create member users first.');
        return;
      }
      
      // Find unassigned tasks
      const unassignedTasks = recentTasks.filter(task => 
        !task.assignedTo || 
        (Array.isArray(task.assignedTo) && task.assignedTo.length === 0) ||
        task.assignedTo === null
      );
      
      console.log('Unassigned tasks found:', unassignedTasks);
      
      if (unassignedTasks.length === 0) {
        // If no unassigned tasks, create one first
        console.log('No unassigned tasks found, creating one first...');
        
        // Select a random member user
        const randomUser = memberUsers[Math.floor(Math.random() * memberUsers.length)];
        
        const newTask = {
          title: "Complete Project Documentation",
          description: "Write comprehensive documentation for the new project including API endpoints, setup instructions, and user guide.",
          priority: "high",
          status: "pending",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: [randomUser._id],
          checklist: [
            { text: "Write API documentation", completed: false },
            { text: "Create setup guide", completed: false },
            { text: "Add user examples", completed: false }
          ]
        };

        const response = await axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, newTask);
        console.log('Task created and assigned successfully:', response.data);
        
        fetchDashboardData();
        window.dispatchEvent(new Event('tasksUpdated'));
        
        alert(`Task "${newTask.title}" has been created and assigned to ${randomUser.name}!`);
        return;
      }
      
      // Assign the first unassigned task to a random member user
      const taskToAssign = unassignedTasks[0];
      const randomUser = memberUsers[Math.floor(Math.random() * memberUsers.length)];
      
      console.log('Assigning task to user:', taskToAssign, randomUser);
      
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(taskToAssign._id), {
        assignedTo: [randomUser._id]
      });
      
      console.log('Task assigned successfully:', response.data);
      
      // Refresh dashboard data
      fetchDashboardData();
      
      // Trigger the tasksUpdated event to notify other components
      window.dispatchEvent(new Event('tasksUpdated'));
      
      alert(`Task "${taskToAssign.title}" has been successfully assigned to ${randomUser.name}!`);
    } catch (error) {
      console.error('Error assigning task:', error);
      console.error('Error response:', error.response);
      
      // Provide more detailed error information
      let errorMessage = 'Failed to assign task';
      if (error.response) {
        errorMessage += `. Server error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += '. Network error - could not reach server';
      } else {
        errorMessage += `. Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleAssignTaskToUser = async () => {
    if (!selectedTask || !selectedUser) {
      return;
    }

    try {
      setAssigningTask(true);
      
      console.log('Assigning task:', selectedTask._id);
      console.log('To user:', selectedUser);
      
      // Update task with assigned user
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(selectedTask._id), {
        assignedTo: [selectedUser]
      });
      
      // Update local state
      setRecentTasks(prev => prev.map(task => 
        task._id === selectedTask._id 
          ? { ...task, assignedTo: [{ _id: selectedUser }] }
          : task
      ));
      
      setShowAssignModal(false);
      setSelectedTask(null);
      setSelectedUser('');
      
      // Trigger the tasksUpdated event to notify other components
      window.dispatchEvent(new Event('tasksUpdated'));
      
      // Show success message
      alert(`Task assigned successfully to ${users.find(u => u._id === selectedUser)?.name}`);
    } catch (error) {
      console.error('Error assigning task:', error);
      console.error('Error response:', error.response);
      alert('Failed to assign task. Please try again.');
    } finally {
      setAssigningTask(false);
    }
  };

  // Filter users to show only members
  const memberUsers = users.filter(user => user.role === 'member');

  // Chart data
  const taskDistributionData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      data: [stats.pendingTasks, stats.inProgressTasks, stats.completedTasks],
      backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981'],
      borderWidth: 0,
    }],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      label: 'Tasks by Priority',
      data: [3, 1, 0], // Replace with actual data from API
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderRadius: 8,
    }],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Good Morning! {user?.name || 'Admin'}</h1>
          <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAssignExistingTaskToUser}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            title="Assign existing task to a real user"
          >
            Assign Existing Task
          </button>
          <button
            onClick={() => navigate('/admin/create-task')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Create New Task
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiClipboard className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Tasks</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiClock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Tasks</h2>
        {recentTasks && recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'in-progress' ? 'In Progress' : 
                         task.status === 'completed' ? 'Completed' : 
                         task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      {task.dueDate && (
                        <span className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <span className="text-sm text-gray-500">
                          Assigned to: {users.find(u => u._id === task.assignedTo[0])?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/tasks/${task._id}`)}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAssignTask(task)}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                      title="Assign to user"
                    >
                      <FiUserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks found</p>
          </div>
        )}
      </div>

      {/* Task Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Assign Task: {selectedTask?.title}
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a user...</option>
                  {memberUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignTaskToUser}
                  disabled={!selectedUser || assigningTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigningTask ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
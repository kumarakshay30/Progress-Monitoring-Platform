import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../../components/common/BackButton';
import { useUser } from "../../context/userContext";
import { 
  FiClipboard, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiUser, 
  FiLogOut, 
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiCalendar,
  FiPlus
} from 'react-icons/fi';
import { format } from 'date-fns';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/user/dashboard';
  const { user, logout } = useUser();

  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get time-based greeting with username
  const getGreeting = () => {
    const hour = new Date().getHours();
    const username = user?.name?.split(' ')[0] || 'there';
    
    let greeting = 'Good ';
    if (hour < 12) greeting += 'Morning';
    else if (hour < 18) greeting += 'Afternoon';
    else greeting += 'Evening';
    
    return `${greeting}, ${username}`;
  };

  // Format date with validation
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'No due date';
      
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      console.log('Starting dashboard data fetch...');
      console.log('Current user:', user);
      
      if (!user || !user._id) {
        console.error('No user or user ID available');
        setLoading(false);
        return;
      }
      
      // Try to fetch user-specific dashboard data first
      try {
        console.log('Fetching user dashboard data...');
        const userDashboardResponse = await axiosInstance.get(API_PATHS.TASKS.GET_USER_DASHBOARD_DATA);
        console.log('User dashboard response:', userDashboardResponse.data);
        
        if (userDashboardResponse.data) {
          setDashboardData({
            totalTasks: userDashboardResponse.data.totalTasks || 0,
            completedTasks: userDashboardResponse.data.completedTasks || 0,
            pendingTasks: userDashboardResponse.data.pendingTasks || 0,
            inProgressTasks: userDashboardResponse.data.inProgressTasks || 0,
            recentTasks: Array.isArray(userDashboardResponse.data.recentTasks) ? userDashboardResponse.data.recentTasks : []
          });
          setLoading(false);
          return;
        }
      } catch (userDashboardError) {
        console.log('User dashboard endpoint failed, falling back to all tasks:', userDashboardError.message);
      }
      
      // Fallback: Fetch all tasks and filter
      console.log('Fetching all tasks as fallback...');
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      
      // Get tasks assigned to current user
      const allTasks = response.data?.tasks || [];
      console.log('Dashboard - All tasks from API:', allTasks);
      console.log('Dashboard - Current user ID:', user._id);
      
      const userTasks = allTasks.filter(task => {
        const isAssigned = task.assignedTo && task.assignedTo.some(assigned => 
          assigned._id === user._id || assigned.id === user._id || assigned === user._id
        );
        console.log(`Dashboard - Task "${task.title}" assignedTo:`, task.assignedTo, 'Matches user:', isAssigned);
        return isAssigned;
      });
      
      console.log('Dashboard - Filtered user tasks:', userTasks);
      
      // Calculate stats
      const totalTasks = userTasks.length;
      const completedTasks = userTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
      
      // Get recent tasks (last 5)
      const recentTasks = userTasks
        .sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || b._id))
        .slice(0, 5);
      
      console.log('Dashboard - Recent tasks:', recentTasks);
      
      setDashboardData({
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        recentTasks: Array.isArray(recentTasks) ? recentTasks : []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      setDashboardData({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        recentTasks: []
      });
      setLoading(false);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      console.log('Waiting for user data...');
      setLoading(false);
    }
  }, [user]);

  // Listen for task updates from admin components
  useEffect(() => {
    const handleTasksUpdated = () => {
      console.log('UserDashboard: tasksUpdated event received, refreshing dashboard data...');
      if (user) {
        fetchDashboardData();
      }
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated);
    
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, [user, fetchDashboardData]);

  const stats = [
    {
      title: 'Total Tasks',
      value: dashboardData.totalTasks,
      icon: <FiClipboard className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'In Progress',
      value: dashboardData.inProgressTasks,
      icon: <FiClock className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: 'Completed',
      value: dashboardData.completedTasks,
      icon: <FiCheckCircle className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Pending',
      value: dashboardData.pendingTasks,
      icon: <FiAlertCircle className="w-6 h-6" />,
      color: 'bg-red-100 text-red-600'
    }
  ];

  // Profile dropdown component
  const ProfileDropdown = () => (
    <AnimatePresence>
      {showProfileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'member'}</p>
            </div>
            <Link
              to="/user/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <FiUser className="mr-2" />
              View Profile
            </Link>
            <Link
              to="/user/change-password"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <FiSettings className="mr-2" />
              Change Password
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              role="menuitem"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {!isDashboard && (
        <div className="mb-4">
          <BackButton to="/user/dashboard" className="text-blue-600 hover:text-blue-800" />
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}</h1>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiUser className="mr-2" />
            Profile
            {showProfileMenu ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
          <ProfileDropdown />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow p-6 flex items-center hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-full ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiList className="text-blue-600 mr-2" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">Assigned Tasks</h2>
            </div>
            <Link
              to="/user/tasks"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All <FiChevronDown className="ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    <span>Due Date</span>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentTasks.length > 0 ? (
                dashboardData.recentTasks.map((task, index) => (
                  <motion.tr 
                    key={task._id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => navigate(`/user/tasks/${task._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : task.status === 'In Progress' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(task.dueDate)}</div>
                      <div className="text-xs text-gray-500">
                        {task.dueDate ? (new Date(task.dueDate) < new Date() ? 'Overdue' : 'Due soon') : 'No due date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        task.priority === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <FiClipboard className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks assigned</h3>
                    <p className="mt-1 text-sm text-gray-500">You don't have any tasks assigned yet.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => navigate('/user/create-task')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                        New Task
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
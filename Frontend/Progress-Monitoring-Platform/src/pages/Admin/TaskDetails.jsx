import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiClock, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUser, 
  FiCalendar, 
  FiPaperclip,
  FiX,
  FiImage,
  FiFileText,
  FiDownload
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

// Mock tasks for fallback
const mockTasks = [
  { 
    _id: '653af7fdb3aab8a6b8e5d5b1', 
    title: 'Update UI Design', 
    priority: 'High', 
    status: 'In Progress', 
    dueDate: '2023-12-15',
    description: 'Update user interface design to match new branding guidelines',
    progress: 65,
    assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b2', name: 'John Doe', email: 'john@example.com' }],
    createdAt: '2023-11-20T10:30:00Z'
  },
  { 
    _id: '653af7fdb3aab8a6b8e5d5b3', 
    title: 'Fix Navigation Bug', 
    priority: 'High', 
    status: 'Pending', 
    dueDate: '2023-12-14',
    description: 'Fix navigation menu not collapsing on mobile devices',
    progress: 0,
    assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b4', name: 'Jane Smith', email: 'jane@example.com' }],
    createdAt: '2023-11-25T14:15:00Z'
  },
  { 
    _id: '653af7fdb3aab8a6b8e5d5b5', 
    title: 'Write Documentation', 
    priority: 'Medium', 
    status: 'In Progress', 
    dueDate: '2023-12-18',
    description: 'Document new API endpoints and update developer guide',
    progress: 30,
    assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b6', name: 'Alex Johnson', email: 'alex@example.com' }],
    createdAt: '2023-11-28T09:45:00Z'
  },
  { 
    _id: '653af7fdb3aab8a6b8e5d5b7', 
    title: 'Test New Features', 
    priority: 'Low', 
    status: 'Completed', 
    dueDate: '2023-12-12',
    description: 'Perform end-to-end testing of new user registration flow',
    progress: 100,
    assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b8', name: 'Sarah Wilson', email: 'sarah@example.com' }],
    completedAt: '2023-12-10T16:20:00Z',
    createdAt: '2023-11-15T11:10:00Z'
  },
  { 
    _id: '653af7fdb3aab8a6b8e5d5b9', 
    title: 'Code Review', 
    priority: 'Medium', 
    status: 'In Progress', 
    dueDate: '2023-12-16',
    description: 'Review and provide feedback on the latest pull requests',
    progress: 40,
    assignedTo: [{ _id: '653af7fdb3aab8a6b8e5d5b2', name: 'John Doe', email: 'john@example.com' }],
    createdAt: '2023-11-29T13:25:00Z'
  }
];
import SelectUsers from '../../components/Inputs/SelectUsers';

// Simple Avatar component to replace AvatarGroup
const AvatarGroup = ({ users, maxVisible = 3 }) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <div 
          key={user._id || index} 
          className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 text-xs font-medium border-2 border-white"
          title={user.name || 'User'}
        >
          {(user.name || 'U').charAt(0).toUpperCase()}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Task data will be fetched from the API

  useEffect(() => {
    const fetchTask = async () => {
      console.log('=== TASK DETAILS COMPONENT DEBUG ===');
      console.log('TaskDetails component mounted');
      console.log('Task ID from params:', id);
      console.log('Task ID type:', typeof id);
      console.log('Task ID is valid:', !!id);
      console.log('=== END TASK DETAILS DEBUG ===');
      
      if (!id) {
        setError('No task ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        console.log('Fetching admin task with ID:', id);
        console.log('API endpoint:', API_PATHS.TASKS.GET_TASK_BY_ID(id));
        
        // Validate task ID format
        if (!id || id === 'undefined' || id === 'null') {
          throw new Error('Invalid task ID format');
        }
        
        // Check if this is a mock task ID (starts with known mock pattern)
        const isMockTaskId = id.startsWith('653af7fd');
        
        if (isMockTaskId) {
          console.log('Detected mock task ID, using mock data fallback');
          // Find the task in mock data
          const mockTask = mockTasks.find(task => task._id === id);
          if (mockTask) {
            setTask(mockTask);
            setEditedTask(mockTask);
            setError('');
            setIsLoading(false);
            return;
          } else {
            throw new Error('Mock task not found');
          }
        }
        
        // Fetch task from API with timeout
        const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(id), {
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });
        
        console.log('Admin task response status:', response.status);
        console.log('Admin task response data:', response.data);
        
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        
        if (response.status === 500) {
          console.error('500 Internal Server Error - Backend issue detected');
          console.error('Error response data:', response.data);
          
          // Try to find task in mock data as fallback
          const mockTask = mockTasks.find(task => task._id === id);
          if (mockTask) {
            console.log('Using mock data fallback for 500 error');
            setTask(mockTask);
            setEditedTask(mockTask);
            setError('');
            toast.error('Using offline data. Some features may be limited.');
            return;
          }
          
          throw new Error('Server error: The server encountered an internal error while fetching this task. This might be a backend issue. Please try again later or contact support.');
        }
        
        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        console.log('=== TASK DATA RECEIVED ===');
        console.log('Task response:', response.data);
        console.log('Task response type:', typeof response.data);
        console.log('Task response keys:', Object.keys(response.data || {}));
        
        // Handle different response structures
        let taskData;
        if (response.data.success && response.data.data) {
          // Backend returns { success: true, data: task }
          taskData = response.data.data;
          console.log('Using response.data.data structure');
        } else if (response.data._id || response.data.title) {
          // Direct task object
          taskData = response.data;
          console.log('Using direct task object structure');
        } else {
          throw new Error('Invalid task data structure received');
        }
        
        console.log('Final task data:', taskData);
        console.log('=== END TASK DATA RECEIVED ===');
        
        setTask(taskData);
        setEditedTask(taskData);
        setError('');
      } catch (err) {
        console.error('Error fetching admin task:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        if (err.response?.status === 404) {
          setError('Task not found');
          toast.error('Task not found');
          // Redirect to tasks list if task not found
          setTimeout(() => navigate('/admin/tasks'), 1500);
        } else if (err.response?.status === 500) {
          setError('Server error: Something went wrong! The server encountered an internal error while fetching this task.');
          toast.error('Server error. Please try again later.');
          // Don't redirect immediately for 500 errors, let user see the error
        } else if (err.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection and try again.');
          toast.error('Request timeout. Please try again.');
        } else if (err.message === 'Network Error') {
          setError('Cannot connect to the server. Please check your internet connection.');
          toast.error('Network error. Please check your connection.');
        } else {
          const errorMessage = err.response?.data?.message || err.message || 'Failed to load task details';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [id, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Progress':
        return <FiClock className="text-blue-500 mr-2" />;
      case 'Completed':
        return <FiCheckCircle className="text-green-500 mr-2" />;
      case 'Pending':
        return <FiAlertCircle className="text-yellow-500 mr-2" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-2 border-red-300 font-semibold';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300 font-semibold';
      case 'Low':
        return 'bg-green-100 text-green-800 border-2 border-green-300 font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 border-2 border-gray-300 font-semibold';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (progress) => {
    if (progress === 100) return 'text-green-700';
    if (progress >= 75) return 'text-blue-700';
    if (progress >= 50) return 'text-yellow-700';
    if (progress >= 25) return 'text-orange-700';
    return 'text-red-700';
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo || []
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Normalize status for backend
      const normalizeStatus = (status) => {
        switch (status?.toLowerCase()) {
          case 'completed': return 'completed';
          case 'in progress': return 'in-progress';
          case 'pending': 
          default: return 'pending';
        }
      };

      // Normalize priority for backend
      const normalizePriority = (priority) => {
        switch (priority?.toLowerCase()) {
          case 'high': return 'high';
          case 'medium': return 'medium';
          case 'low': 
          default: return 'medium';
        }
      };

      // Prepare data for backend
      const updateData = {
        title: editedTask.title,
        description: editedTask.description,
        priority: normalizePriority(editedTask.priority),
        status: normalizeStatus(editedTask.status),
        dueDate: editedTask.dueDate,
        assignedTo: editedTask.assignedTo
      };

      console.log('Sending update data:', updateData);
      
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(id), updateData);
      console.log('Update response:', response.data);
      
      if (response.data && response.data.success) {
        setTask(response.data.data);
        setIsEditMode(false);
        setEditedTask(null);
        toast.success('Task updated successfully');
      } else {
        // Handle case where success field is missing but we have data
        if (response.data) {
          setTask(response.data);
          setIsEditMode(false);
          setEditedTask(null);
          toast.success('Task updated successfully');
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      toast.error(errorMessage);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTask(null);
  };

  const handleInputChange = (field, value) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/users/for-assignment');
      if (response.data && response.data.success) {
        setAvailableUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const handleAssignUsers = async (selectedUserIds) => {
    try {
      // Convert user IDs back to user objects
      const assignedUsers = availableUsers.filter(user => selectedUserIds.includes(user._id));
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(id), {
        assignedTo: assignedUsers
      });
      
      if (response.data && response.data.success) {
        setTask(response.data.data);
        setIsAssignMode(false);
        toast.success('Task assigned successfully');
      }
    } catch (error) {
      console.error('Error assigning users:', error);
      toast.error('Failed to assign users');
    }
  };

  const handleUnassignUser = async (userId) => {
    try {
      const updatedAssignedTo = task.assignedTo.filter(user => user._id !== userId);
      const response = await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK(id), {
        assignedTo: updatedAssignedTo
      });
      
      if (response.data && response.data.success) {
        setTask(response.data.data);
        toast.success('User unassigned successfully');
      }
    } catch (error) {
      console.error('Error unassigning user:', error);
      toast.error('Failed to unassign user');
    }
  };

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post(
        API_PATHS.TASKS.UPDATE_TASK(id) + '/attachments',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data && response.data.success) {
        setTask(response.data.data);
        toast.success('Files uploaded successfully');
        setSelectedFiles([]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      if (attachment.url) {
        // If URL is available, download directly
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Otherwise, fetch from server
        const response = await axiosInstance.get(
          `/api/tasks/${id}/attachments/${attachment.id}/download`,
          {
            responseType: 'blob'
          }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/tasks/${id}/attachments/${attachmentId}`
      );
      
      if (response.data && response.data.success) {
        setTask(response.data.data);
        toast.success('Attachment deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      toast.error('Failed to delete attachment');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const comment = {
      id: uuidv4(),
      user: 'Current User', // In a real app, get from auth context
      text: newComment,
      timestamp: new Date().toISOString(),
      attachments: [...selectedFiles.map(file => ({
        id: uuidv4(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
        url: URL.createObjectURL(file)
      }))]
    };

    setTask(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }));

    setNewComment('');
    setSelectedFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FiImage className="mr-2" />;
    return <FiFileText className="mr-2" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = () => {
    // Add delete functionality
    if (window.confirm('Are you sure you want to delete this task?')) {
      // Delete task and redirect to tasks list
      navigate('/admin/tasks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('=== RENDER CHECK ===');
  console.log('Current task state:', task);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);
  console.log('=== END RENDER CHECK ===');

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-700">Task not found</h2>
        <p className="mt-2 text-gray-500">The requested task could not be found.</p>
        <button
          onClick={() => navigate('/admin/tasks')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Task Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detailed information about the task</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </button>
          {!isEditMode ? (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit className="mr-1.5 h-4 w-4" /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiTrash2 className="mr-1.5 h-4 w-4" /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiCheckCircle className="mr-1.5 h-4 w-4" /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiX className="mr-1.5 h-4 w-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          {isEditMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editedTask.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editedTask.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} border`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <FiCalendar className="mr-1.5 h-4 w-4" />
                <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  {getStatusIcon(task.status)}
                  <span>{task.status}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                <p className="text-gray-700">{task.description || 'No description provided'}</p>
              </div>

              {/* Additional Task Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
                  <p className="text-gray-700">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Unknown'}
                  </p>
                  {task.createdBy && (
                    <p className="text-sm text-gray-500 mt-1">
                      by {task.createdBy.name || task.createdBy.email || 'Unknown'}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
                  <p className="text-gray-700">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never updated'}
                  </p>
                </div>
              </div>

              {/* Task Progress and Additional Info */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Task Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Completion</span>
                  <span className={`text-sm font-bold ${getProgressTextColor(task.progress)}`}>
                    {task.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColor(task.progress)} h-2 rounded-full transition-all duration-300 ease-in-out`} 
                    style={{ width: `${task.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
              {!isAssignMode && (
                <button
                  onClick={() => {
                    setIsAssignMode(true);
                    fetchAvailableUsers();
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Assign Users
                </button>
              )}
            </div>
            
            {isAssignMode ? (
              <div className="bg-white shadow rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Users to Assign
                  </label>
                  <SelectUsers
                    selectedUsers={(task.assignedTo || []).map(user => user._id)}
                    onSelectionChange={handleAssignUsers}
                    availableUsers={availableUsers}
                    multiSelect={true}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsAssignMode(false)}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {task.assignedTo && task.assignedTo.length > 0 ? (
                    task.assignedTo.map((user) => (
                      <li key={user._id} className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role || 'member'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnassignUser(user._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-gray-500">No one assigned yet</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Progress</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Work Done</span>
                  <span className={`text-sm font-bold ${getProgressTextColor(task.progress)}`}>
                    {task.progress}%
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`${getProgressColor(task.progress)} h-3 rounded-full transition-all duration-300 ease-in-out`} 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  {task.progress === 100 ? (
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="mr-2" />
                      <span className="font-medium">Task Completed!</span>
                    </div>
                  ) : task.progress >= 75 ? (
                    <div className="flex items-center text-blue-600">
                      <FiClock className="mr-2" />
                      <span className="font-medium">Almost Done</span>
                    </div>
                  ) : task.progress >= 50 ? (
                    <div className="flex items-center text-yellow-600">
                      <FiClock className="mr-2" />
                      <span className="font-medium">In Progress</span>
                    </div>
                  ) : task.progress >= 25 ? (
                    <div className="flex items-center text-orange-600">
                      <FiAlertCircle className="mr-2" />
                      <span className="font-medium">Just Started</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <FiAlertCircle className="mr-2" />
                      <span className="font-medium">Not Started</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Attachments</h3>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {task.attachments && task.attachments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {task.attachments.map((file) => (
                  <li key={file.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {file.type === 'image' ? (
                          <FiImage className="h-5 w-5 text-gray-400 mr-3" />
                        ) : (
                          <FiFileText className="h-5 w-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size || 0)}</p>
                          {file.uploadedBy && (
                            <p className="text-xs text-gray-400">Uploaded by: {file.uploadedBy}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadAttachment(file)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Download"
                        >
                          <FiDownload className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No attachments from assigned users yet</div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Comments</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {task.comments && task.comments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {task.comments.map((comment) => (
                  <li key={comment.id} className="px-4 py-3">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500">
                        <FiUser className="h-4 w-4" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{comment.user}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                        
                        {/* Comment Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {comment.attachments.map(file => (
                              <div key={file.id} className="flex items-center text-sm text-gray-600">
                                {getFileIcon(file)}
                                <a 
                                  href={file.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {file.name}
                                </a>
                                <span className="text-xs text-gray-500 ml-2">({formatFileSize(file.size)})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No comments yet. Be the first to comment!</div>
            )}
            
            {/* Add Comment Form */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-2">
                  <textarea
                    rows="2"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* File attachments */}
                {selectedFiles.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center bg-white px-2 py-1 rounded border border-gray-200 text-xs">
                          {getFileIcon(file)}
                          <span className="max-w-xs truncate">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)}
                            className="ml-1 text-gray-400 hover:text-red-500"
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPaperclip className="mr-1.5 h-4 w-4" />
                      Attach files
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newComment.trim() && selectedFiles.length === 0}
                    className={`inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      newComment.trim() || selectedFiles.length > 0 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-300 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

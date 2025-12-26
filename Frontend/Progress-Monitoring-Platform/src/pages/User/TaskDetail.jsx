import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '../../context/userContext';
import { 
  ArrowLeft as BackIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  AlertCircle as PriorityIcon,
  AlertTriangle as AlertIcon,
  User as UserIcon,
  CheckCircle as CheckIcon,
  ListChecks as TodoIcon,
  FileText as DescriptionIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Paperclip as AttachmentIcon,
  MessageSquare as CommentIcon,
  X as XIcon,
  Send as SendIcon,
  Check as CheckMarkIcon,
  Image as ImageIcon,
  File as FileIcon,
  Download as DownloadIcon,
  Plus as PlusIcon,
  ClipboardList as TaskIcon,
  Clock as PendingIcon,
  CheckCircle2 as CompletedIcon,
  AlertOctagon as OverdueIcon,
  RefreshCw as UpdateIcon,
  TrendingUp as ProgressIcon
} from 'lucide-react';

const statusOptions = ['Pending', 'In Progress', 'Completed'];
const priorityOptions = ['Low', 'Medium', 'High'];

// Helper function to normalize status for backend
const normalizeStatusForBackend = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'in progress':
      return 'in-progress';
    case 'pending':
    default:
      return 'pending';
  }
};

const Comment = ({ comment, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(comment._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex space-x-3 group">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
          {comment.user?.name?.charAt(0) || 'U'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {comment.user?.name || 'Unknown User'}
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{comment.text}</p>
            {comment.attachments?.length > 0 && (
              <div className="mt-2 space-y-2">
                {comment.attachments.map((file, idx) => (
                  <a
                    key={idx}
                    href={`${process.env.REACT_APP_API_URL || ''}${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FileIcon className="h-4 w-4 mr-1" />
                    {file.name}
                  </a>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
          {user?._id === comment.user?._id && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 disabled:opacity-50"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const FilePreview = ({ file, onRemove }) => {
  const fileType = file.type?.split('/')[0];
  
  return (
    <div className="relative group">
      <div className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200">
        {fileType === 'image' ? (
          <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
        ) : (
          <FileIcon className="h-5 w-5 text-gray-400 mr-2" />
        )}
        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
        <button
          type="button"
          onClick={() => onRemove(file.name)}
          className="ml-auto text-gray-400 hover:text-red-500"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const TaskDetail = () => {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: ''
  });

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        console.error('No task ID provided in URL');
        setError('Invalid task URL. No task ID provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching task with ID:', taskId);
        console.log('Task ID type:', typeof taskId);
        console.log('API endpoint:', API_PATHS.TASKS.GET_TASK_BY_ID(taskId));
        
        // Validate task ID format
        if (!taskId || taskId === 'undefined' || taskId === 'null') {
          throw new Error('Invalid task ID format');
        }
        
        const response = await axiosInstance.get(API_PATHS.TASKS.GET_TASK_BY_ID(taskId), {
          timeout: 10000,
          validateStatus: function (status) {
            return status >= 200 && status < 500;
          }
        });

        console.log('Response status:', response.status);
        console.log('Response data:', response.data);

        if (response.status === 404) {
          throw new Error('Task not found');
        }

        if (!response.data) {
          throw new Error('No data received from server');
        }
        
        setTask(response.data);
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
          status: response.data.status || 'Pending',
          priority: response.data.priority || 'Medium',
          dueDate: response.data.dueDate ? response.data.dueDate.split('T')[0] : ''
        });
      } catch (error) {
        console.error('Error fetching task:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        if (error.response?.status === 500) {
          console.error('500 Internal Server Error - Backend issue detected');
          setError('Server error: The server encountered an internal error while fetching this task. This might be a backend issue. Please try again later or contact support.');
        } else if (error.code === 'ECONNABORTED') {
          setError('Request timeout. Please check your connection and try again.');
        } else if (error.message === 'Network Error') {
          setError('Cannot connect to the server. Please check your internet connection.');
        } else {
          setError(`Error: ${error.response?.data?.message || error.message || 'Failed to load task details'}`);
        }
        
        setTimeout(() => {
          navigate('/user/tasks');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId), { 
        status: normalizeStatusForBackend(newStatus) 
      });
      setTask(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update task status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const normalizedFormData = {
        ...formData,
        status: normalizeStatusForBackend(formData.status)
      };
      const response = await axiosInstance.put(
        API_PATHS.TASKS.UPDATE_TASK(taskId),
        normalizedFormData
      );
      setTask(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(taskId));
        navigate('/user/tasks');
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name !== fileName));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const formData = new FormData();
    formData.append('text', commentText);
    
    // Add files to form data
    files.forEach((file, index) => {
      formData.append(`attachments`, file.file);
    });

    try {
      setIsSubmittingComment(true);
      const response = await axiosInstance.post(
        API_PATHS.TASKS.ADD_COMMENT(taskId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update task with new comment
      setTask(prev => ({
        ...prev,
        comments: [response.data, ...(prev.comments || [])]
      }));
      
      // Reset form
      setCommentText('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_COMMENT(taskId, commentId));
      setTask(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment._id !== commentId)
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const handleMarkAsComplete = async () => {
    if (window.confirm('Mark this task as complete?')) {
      try {
        const response = await axiosInstance.put(
          API_PATHS.TASKS.UPDATE_TASK_STATUS(taskId),
          { status: 'completed' }
        );
        setTask(prev => ({
          ...prev,
          status: 'Completed',
          completedAt: response.data.completedAt
        }));
      } catch (error) {
        console.error('Error marking task as complete:', error);
        setError('Failed to update task status');
      }
    }
  };

  const handleDownloadAttachment = async (fileUrl, fileName) => {
    try {
      const response = await axiosInstance.get(fileUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'attachment');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const handleTodoToggle = async (todoId, completed) => {
    try {
      await axiosInstance.put(`${API_PATHS.TASKS.UPDATE_TASK(taskId)}/todos`, {
        todoId,
        completed
      });
      setTask(prev => ({
        ...prev,
        todos: prev.todos.map(todo => 
          todo.id === todoId ? { ...todo, completed } : todo
        )
      }));
    } catch (error) {
      console.error('Error updating todo:', error);
      setError('Failed to update todo item');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertIcon className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">Task not found</h2>
        <p className="mt-2 text-gray-600">The requested task could not be found.</p>
        <Link
          to="/user/tasks"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <BackIcon className="-ml-1 mr-2 h-5 w-5" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <BackIcon className="mr-2 h-4 w-4" />
          Back to Tasks
        </button>
        
        {task?.status !== 'Completed' && (
          <button
            onClick={handleMarkAsComplete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <CheckMarkIcon className="-ml-1 mr-2 h-5 w-5" />
            Mark as Complete
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('details')}
            className={`${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Task Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Comments ({task?.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`${
              activeTab === 'attachments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Attachments ({task?.attachments?.length || 0})
          </button>
        </nav>
      </div>

      {activeTab === 'details' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="block w-full border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-blue-500 text-lg font-medium"
                />
              ) : (
                task.title
              )}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Task details and information
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <EditIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <DeleteIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Delete
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data
                    setFormData({
                      title: task.title,
                      description: task.description,
                      status: task.status,
                      priority: task.priority,
                      dueDate: task.dueDate.split('T')[0]
                    });
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <DescriptionIcon className="mr-2 h-5 w-5 text-gray-400" />
                Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="whitespace-pre-line">{task.description || 'No description provided'}</p>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
                Due Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  />
                ) : (
                  task.dueDate ? (
                    new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })
                  ) : (
                    'No due date set'
                  )
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-gray-400" />
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                    {task.status || 'Pending'}
                  </span>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <PriorityIcon className="mr-2 h-5 w-5 text-gray-400" />
                Priority
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {isEditing ? (
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                )}
              </dd>
            </div>

            {/* Additional Task Metadata */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-gray-400" />
                Created
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Unknown'}
                {task.createdBy && (
                  <span className="text-sm text-gray-500 ml-2">
                    by {task.createdBy.name || task.createdBy.email || 'Unknown'}
                  </span>
                )}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UpdateIcon className="mr-2 h-5 w-5 text-gray-400" />
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never updated'}
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <ProgressIcon className="mr-2 h-5 w-5 text-gray-400" />
                Progress
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${task.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {task.progress || 0}%
                  </span>
                </div>
              </dd>
            </div>

            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <UserIcon className="mr-2 h-5 w-5 text-gray-400" />
                Assigned To
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {task.assignedTo?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="ml-2">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </dd>
            </div>

            {task.todos && task.todos.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-start">
                  <TodoIcon className="mr-2 h-5 w-5 text-gray-400 mt-0.5" />
                  Checklist
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {task.todos.map((todo, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleTodoToggle(todo.id, !todo.completed)}
                            className={`h-4 w-4 rounded border ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'} flex-shrink-0`}
                          >
                            {todo.completed && <CheckIcon className="h-3 w-3 text-white" />}
                          </button>
                          <span className={`ml-2 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {todo.text}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {!isEditing && (
          <div className="px-4 py-4 sm:px-6 flex justify-between border-t border-gray-200">
            <div className="flex space-x-3">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={task.status === status}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    task.status === status
                      ? 'bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Comments</h3>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div>
                <label htmlFor="comment" className="sr-only">
                  Add a comment
                </label>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    name="comment"
                    id="comment"
                    ref={commentInputRef}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
              </div>

              {/* File attachments */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <FilePreview 
                      key={index} 
                      file={file} 
                      onRemove={removeFile} 
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PaperclipIcon className="-ml-0.5 mr-2 h-4 w-4" />
                    Attach files
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingComment || (!commentText.trim() && files.length === 0)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post comment'}
                  <SendIcon className="ml-2 -mr-1 h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Comments list */}
            <div className="mt-8 space-y-6">
              {task?.comments?.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment._id} className="border-t border-gray-200 pt-4">
                    <Comment 
                      comment={comment} 
                      onDelete={handleDeleteComment} 
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CommentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Be the first to comment on this task.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attachments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Attachments</h3>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  Add files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {task?.attachments?.length > 0 ? (
              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {task.attachments.map((file, index) => (
                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                    <div className="w-0 flex-1 flex items-center">
                      <PaperclipIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                      <span className="ml-2 flex-1 w-0 truncate">
                        {file.name}
                      </span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleDownloadAttachment(file.url, file.name)}
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        <DownloadIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <PaperclipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by uploading a file.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Upload files
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;

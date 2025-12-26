import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import API_PATHS from '../../utils/apiPaths';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import { LuFileSpreadsheet } from 'react-icons/lu';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import Loader from '../../components/common/Loader';

const ManageTasks = () => {
  const navigate = useNavigate();
  
  // Mock tasks from AdminDashboard - same as AdminDashboard component
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

  const [allTasks, setAllTasks] = useState(mockTasks);
  const [tabs, setTabs] = useState([
    { label: "All", count: 0 },
    { label: "Pending", count: 0 },
    { label: "In Progress", count: 0 },
    { label: "Completed", count: 0 },
  ]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to handle tab change
  const handleTabChange = (tabLabel) => {
    setFilterStatus(tabLabel);
  };

  const getAllTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching all tasks from API...');
      console.log('API endpoint:', API_PATHS.TASKS.GET_ALL_TASKS);
      
      // Fetch real tasks from API
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      
      console.log('API response:', response.data);
      console.log('Response status:', response.status);
      
      let tasks = [];
      
      // Handle different response structures
      if (response.data && response.data.tasks) {
        tasks = response.data.tasks;
        console.log('Using response.data.tasks:', tasks);
      } else if (response.data && Array.isArray(response.data)) {
        tasks = response.data;
        console.log('Using response.data as array:', tasks);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        tasks = response.data.data;
        console.log('Using response.data.data as array:', tasks);
      } else {
        console.log('Unexpected response structure, using mock data');
        console.log('Full response keys:', Object.keys(response.data));
        console.log('Full response:', response);
        tasks = [...mockTasks];
      }
      
      if (!Array.isArray(tasks)) {
        console.log('Tasks is not an array, using mock data');
        tasks = [...mockTasks];
      }
      
      console.log('Final tasks array:', tasks);
      
      // Calculate status counts first
      const statusCounts = tasks.reduce((acc, task) => {
        acc.all++;
        // Handle both "In Progress" and "in-progress" status formats
        if (task.status === 'Pending' || task.status === 'pending') acc.pending++;
        else if (task.status === 'In Progress' || task.status === 'in-progress') acc.inProgress++;
        else if (task.status === 'Completed' || task.status === 'completed') acc.completed++;
        return acc;
      }, { all: 0, pending: 0, inProgress: 0, completed: 0 });
      
      // Update tabs with counts
      setTabs([
        { label: "All", count: statusCounts.all },
        { label: "Pending", count: statusCounts.pending },
        { label: "In Progress", count: statusCounts.inProgress },
        { label: "Completed", count: statusCounts.completed },
      ]);

      // Filter tasks based on selected status
      const filteredTasks = filterStatus === "All" 
        ? tasks 
        : tasks.filter(task => {
            // Handle both status formats for consistent filtering
            if (filterStatus === "In Progress") {
              return task.status === "In Progress" || task.status === "in-progress";
            }
            if (filterStatus === "Pending") {
              return task.status === "Pending" || task.status === "pending";
            }
            if (filterStatus === "Completed") {
              return task.status === "Completed" || task.status === "completed";
            }
            return task.status === filterStatus;
          });

      // Update tasks with filtered list
      setAllTasks(filteredTasks);
      
    } catch (error) {
      console.error("Error fetching tasks:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      
      // Fallback to mock data if API fails
      console.log("Using mock data as fallback");
      const tasks = [...mockTasks];
      const filteredTasks = filterStatus === "All" 
        ? tasks 
        : tasks.filter(task => {
            // Handle both status formats for consistent filtering
            if (filterStatus === "In Progress") {
              return task.status === "In Progress" || task.status === "in-progress";
            }
            if (filterStatus === "Pending") {
              return task.status === "Pending" || task.status === "pending";
            }
            if (filterStatus === "Completed") {
              return task.status === "Completed" || task.status === "completed";
            }
            return task.status === filterStatus;
          });
      
      if (filteredTasks.length > 0) {
        // Only show error if we have mock data to display
        setAllTasks(filteredTasks);
        // Don't set error state if we have fallback data
        toast.error("Using offline data. Some features may be limited.");
      } else {
        // Show error if no data available at all
        setError("Failed to load tasks. Please try again later.");
        toast.error("Failed to load tasks. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  const handleClick = (task) => {
    console.log('=== TASK CLICK DEBUG ===');
    console.log('Task clicked for details:', task);
    console.log('Task ID:', task._id);
    console.log('Task ID type:', typeof task._id);
    console.log('Navigation path:', `/admin/tasks/${task._id}`);
    console.log('=== END TASK CLICK DEBUG ===');
    navigate(`/admin/tasks/${task._id}`);
  };

  const handleDownloadReport = async () => {
    try {
      setIsLoading(true);
      
      // Use mock tasks data
      const tasks = [...mockTasks];
      
      if (!tasks.length) {
        toast.error('No tasks available to download');
        return;
      }

      // Calculate chart data
      const statusCounts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});

      const priorityCounts = tasks.reduce((acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {});

      // Format current date for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Create CSV sections
      const sections = [];
      
      // 1. Task List Section
      const taskHeaders = [
        'Title', 'Description', 'Status', 'Priority', 'Progress', 'Assigned To', 'Due Date', 'Created At'
      ];
      
      const taskRows = tasks.map(task => {
        const assignedUsers = task.assignedTo?.map(user => 
          user.name || 'Unassigned'
        ).join('; ') || 'Unassigned';

        return [
          `"${task.title || ''}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          `"${task.status || ''}"`,
          `"${task.priority || ''}"`,
          `"${task.progress || 0}%"`,
          `"${assignedUsers}"`,
          `"${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}"`,
          `"${task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}"`
        ].join(',');
      });

      // 2. Status Distribution Section
      const statusHeaders = ['Status', 'Count'];
      const statusRows = Object.entries(statusCounts).map(([status, count]) => 
        [`"${status}"`, `"${count}"`].join(',')
      );

      // 3. Priority Distribution Section
      const priorityHeaders = ['Priority', 'Count'];
      const priorityRows = Object.entries(priorityCounts).map(([priority, count]) => 
        [`"${priority}"`, `"${count}"`].join(',')
      );

      // Combine all sections with headers
      const csvContent = [
        'TASK REPORT',
        `Generated on: ${new Date().toLocaleString()}`,
        '\nTASKS',
        taskHeaders.join(','),
        ...taskRows,
        '\nSTATUS DISTRIBUTION',
        statusHeaders.join(','),
        ...statusRows,
        '\nPRIORITY DISTRIBUTION',
        priorityHeaders.join(','),
        ...priorityRows
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([`\uFEFF` + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set the file name
      link.setAttribute('download', `tasks-report-${timestamp}.csv`);
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllTasks();
  }, [filterStatus, getAllTasks]);

  // Listen for task updates from other components
  useEffect(() => {
    const handleTasksUpdated = () => {
      console.log('=== TASKS UPDATED EVENT RECEIVED ===');
      console.log('Tasks updated event received in ManageTasks, refreshing tasks...');
      console.log('Current filterStatus:', filterStatus);
      console.log('Calling getAllTasks()...');
      getAllTasks();
      console.log('=== END TASKS UPDATED EVENT HANDLING ===');
    };

    console.log('Setting up tasksUpdated event listener in ManageTasks');
    window.addEventListener('tasksUpdated', handleTasksUpdated);
    
    return () => {
      console.log('Cleaning up tasksUpdated event listener in ManageTasks');
      window.removeEventListener('tasksUpdated', handleTasksUpdated);
    };
  }, [getAllTasks, filterStatus]);

  return (
    <div className="my-5">
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-black">My Tasks</h2>
          <button
            className="flex md:hidden download-btn"
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-lg mr-2" />
            Download Report
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4 lg:mt-0">
          <TaskStatusTabs
            tabs={tabs}
            activeTab={filterStatus}
            setActiveTab={handleTabChange}
          />
          <button
            className="hidden lg:flex download-btn"
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-lg mr-2" />
            Download Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : allTasks.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/create-task')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Task
            </button>
          </div>
        </div>
      ) : (
        <div className="task-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {allTasks.map((item) => {
            console.log('=== MANAGE TASKS DEBUG ===');
            console.log('ManageTasks item:', item);
            console.log('ManageTasks item.assignedTo:', item.assignedTo);
            console.log('ManageTasks item.assignedTo type:', typeof item.assignedTo);
            console.log('ManageTasks item.assignedTo isArray:', Array.isArray(item.assignedTo));
            
            // Format the task data to match TaskCard props
            const taskData = {
              _id: item._id,
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              progress: item.progress || 0,
              dueDate: item.dueDate,
              assignedTo: item.assignedTo || [], // Handle both string (ObjectId) and array formats
              attachments: item.attachments || [],
              completedTodoCount: item.completedTodoCount || 0,
              todoChecklist: item.todoChecklist || []
            };
            
            console.log('TaskCard taskData:', taskData);
            console.log('TaskCard taskData.assignedTo:', taskData.assignedTo);
            console.log('TaskCard taskData.assignedTo type:', typeof taskData.assignedTo);
            console.log('=== END MANAGE TASKS DEBUG ===');

            return (
              <div key={item._id} onClick={() => handleClick(item)}>
                <TaskCard
                  {...taskData}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Wrap the component with ErrorBoundary and Suspense for better error handling and loading states
const ManageTasksWithErrorBoundary = () => (
  <ErrorBoundary>
    <Suspense fallback={<Loader fullScreen />}>
      <ManageTasks />
    </Suspense>
  </ErrorBoundary>
);

export default ManageTasksWithErrorBoundary;
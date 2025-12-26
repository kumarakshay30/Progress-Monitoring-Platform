import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import TaskStatusTabs from '../../components/TaskStatusTabs';
import TaskCard from '../../components/Cards/TaskCard';
import { FiFileSpreadsheet } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { useUser } from '../../context/userContext';

const UserManageTasks = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [allTasks, setAllTasks] = useState([]);
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

  const getUserTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all tasks and filter for user's assigned tasks
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
      const allTasksData = response.data?.tasks || [];
      
      console.log('All tasks from API:', allTasksData);
      console.log('Current user:', user);
      
      // Filter tasks assigned to current user
      const userTasks = allTasksData.filter(task => {
        const isAssigned = task.assignedTo && task.assignedTo.some(assigned => {
          const matches = assigned._id === user?._id || assigned.id === user?._id;
          console.log(`Task "${task.title}" assigned to:`, assigned, 'Matches user:', matches);
          return matches;
        });
        return isAssigned;
      });
      
      console.log('Filtered user tasks:', userTasks);
      
      // Calculate status counts
      const statusCounts = userTasks.reduce((acc, task) => {
        acc.all++;
        if (task.status === 'Pending') acc.pending++;
        else if (task.status === 'In Progress') acc.inProgress++;
        else if (task.status === 'Completed') acc.completed++;
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
        ? userTasks 
        : userTasks.filter(task => task.status === filterStatus);

      console.log('Final filtered tasks:', filteredTasks);

      // Update tasks with filtered list
      setAllTasks(filteredTasks);
      
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      setError("Failed to load tasks. Please try again later.");
      toast.error("Failed to load tasks. Please try again later.");
      setAllTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, user?._id, user]);

  const handleClick = (task) => {
    console.log('Task clicked for details:', task);
    navigate(`/user/tasks/${task._id}`);
  };

  // Fetch tasks when component mounts or filter changes
  useEffect(() => {
    getUserTasks();
  }, [getUserTasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-medium mb-2">Error Loading Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={getUserTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Tasks</h1>
        <p className="text-gray-600">View and manage all tasks assigned to you</p>
      </div>

      {/* Status Tabs */}
      <div className="mb-6">
        <TaskStatusTabs 
          tabs={tabs} 
          activeTab={filterStatus} 
          onTabChange={handleTabChange} 
        />
      </div>

      {/* Tasks Grid */}
      {allTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTasks.map((task) => (
            <TaskCard
              key={task._id}
              title={task.title}
              description={task.description}
              priority={task.priority}
              status={task.status}
              progress={task.progress}
              dueDate={task.dueDate}
              assignedTo={task.assignedTo}
              attachmentCount={task.attachmentCount}
              completedTodoCount={task.completedTodoCount}
              todoChecklist={task.todoChecklist}
              onClick={() => handleClick(task)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">
            {filterStatus === "All" 
              ? "You don't have any tasks assigned yet." 
              : `You don't have any ${filterStatus.toLowerCase()} tasks.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManageTasks;

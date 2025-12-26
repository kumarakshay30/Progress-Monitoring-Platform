import React from 'react';
import { FiChevronRight, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-50 text-red-700 border border-red-100';
    case 'Medium':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    case 'Low':
      return 'bg-green-50 text-green-700 border border-green-100';
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-100';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Completed':
      return 'bg-green-50 text-green-600 border border-green-100';
    case 'Pending':
      return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
    default:
      return 'bg-gray-50 text-gray-600 border border-gray-100';
  }
};

const RecentTasksTable = ({ tasks = [] }) => {
  const navigate = useNavigate();
  
  const handleViewAll = () => {
    navigate('/admin/tasks');
  };
  
  const handleViewTask = (taskId) => {
    console.log('Viewing task with ID:', taskId); // Debug log
    if (!taskId) {
      console.error('Invalid task ID:', taskId);
      return;
    }
    // Navigate to the task details page with the correct URL structure
    navigate(`/admin/tasks/${taskId}`, { state: { from: 'dashboard' } });
  };
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
        <button 
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center focus:outline-none rounded px-2 py-1 transition-colors duration-200"
        >
          View All <FiChevronRight className="ml-1 text-blue-500" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task, index) => (
              <tr 
                key={task.id || index} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewTask(task.id || task._id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTask(task.id || task._id);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!(task.id || task._id)}
                    title={!(task.id || task._id) ? 'Task ID not available' : 'View task details'}
                  >
                    <FiEye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTasksTable;

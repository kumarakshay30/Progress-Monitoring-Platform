import React from 'react';
import moment from 'moment';

const TaskListTable = ({ tableData = [] }) => {

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-500 border border-green-200';
      case 'Pending':
        return 'bg-purple-100 text-purple-500 border border-purple-200';
      case 'In Progress':
        return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-500 border border-red-200';
      case 'Medium':
        return 'bg-orange-100 text-orange-500 border border-orange-200';
      case 'Low':
        return 'bg-green-100 text-green-500 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  return (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
            <thead>
                <tr className=''>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">Priority</th>
                    <th className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700">created On</th>
                
                </tr>
            </thead>
            <tbody>
                {tableData.map((task, index) => (
                    <tr key={task.id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                          {task.title || task.name || "Untitled Task"}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status || task.statusLabel)}`}>
                              {task.statusLabel || task.status || "Pending"}
                            </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(task.priority || task.priorityLabel)}`}>
                              {task.priorityLabel || task.priority || "Medium"}
                            </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-800">
                          {task.createdAt ? moment(task.createdAt).format('Do MMM YYYY') : 'N/A'}
                        </td>
                    </tr>
                ))}  
                </tbody>
                </table>
    </div>
    );
};

export default TaskListTable;

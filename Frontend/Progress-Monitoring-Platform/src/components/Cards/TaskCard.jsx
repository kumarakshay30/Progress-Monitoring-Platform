import React from 'react';
import { HiOutlinePaperClip } from 'react-icons/hi2'; // Paperclip icon from react-icons
import { LuPaperclip } from 'react-icons/lu'; // Another Paperclip icon variant (you can choose either)

const TaskCard = ({
  title,
  description,
  priority,
  status,
  progress,
  dueDate,
  assignedTo,
  attachmentCount,
  completedTodoCount,
  todoChecklist,
  onClick
}) => {
  // Debug logging to understand the data structure
  console.log('TaskCard assignedTo data:', assignedTo);
  console.log('TaskCard title:', title);
  console.log('TaskCard status:', status);
  console.log('TaskCard priority:', priority);
  console.log('TaskCard progress:', progress);
  console.log('TaskCard dueDate:', dueDate);
  
  // Function to get the color for the status tag
  const getStatusTagColor = () => {
    console.log('getStatusTagColor called with status:', status);
    switch (status) {
      case "In Progress":
        console.log('Returning In Progress color');
        return "text-blue-600 bg-blue-50 border border-blue-200";
      case "Completed":
        console.log('Returning Completed color');
        return "text-green-600 bg-green-50 border border-green-200";
      case "Pending":
        console.log('Returning Pending color');
        return "text-purple-600 bg-purple-50 border border-purple-200";
      default:
        console.log('Returning default color for status:', status);
        return "text-gray-500 bg-gray-50 border border-gray-200";
    }
  };

  // Function to format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      
      // Format the date to a readable format
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return "N/A";
    }
  };

  // Function to get assigned user display name
  const getAssignedUserDisplay = () => {
    console.log('TaskCard - assignedTo value:', assignedTo);
    console.log('TaskCard - assignedTo type:', typeof assignedTo);
    console.log('TaskCard - assignedTo isArray:', Array.isArray(assignedTo));
    
    if (!assignedTo) {
      console.log('TaskCard - No assignedTo, returning Unassigned');
      return "Unassigned";
    }
    
    // Handle single ObjectId string (backend format)
    if (typeof assignedTo === 'string') {
      console.log('TaskCard - assignedTo is string ObjectId:', assignedTo);
      // For single ObjectId, we can't get user details without additional API call
      // So we'll show a generic assigned status
      return "Assigned";
    }
    
    // Handle array format (frontend format)
    if (Array.isArray(assignedTo)) {
      console.log('TaskCard - assignedTo is array with length:', assignedTo.length);
      if (assignedTo.length === 0) {
        console.log('TaskCard - Empty array, returning Unassigned');
        return "Unassigned";
      }
      
      const firstUser = assignedTo[0];
      console.log('TaskCard - First user in array:', firstUser);
      
      if (firstUser.name) return firstUser.name;
      if (firstUser.email) return firstUser.email;
      if (firstUser._id) return `User ${firstUser._id.slice(0, 8)}...`;
      return "Assigned";
    }
    
    // Handle object format
    if (typeof assignedTo === 'object' && assignedTo !== null) {
      console.log('TaskCard - assignedTo is object:', assignedTo);
      if (assignedTo.name) return assignedTo.name;
      if (assignedTo.email) return assignedTo.email;
      if (assignedTo._id) return `User ${assignedTo._id.slice(0, 8)}...`;
      return "Assigned";
    }
    
    // Fallback
    console.log('TaskCard - Fallback case, returning Assigned');
    return "Assigned";
  };

  // Function to get progress bar color based on percentage
  const getProgressColor = () => {
    const progressValue = Math.min(Math.max(Number(progress) || 0, 0), 100);
    if (progressValue === 100) return "bg-green-500";
    if (progressValue >= 75) return "bg-blue-500";
    if (progressValue >= 50) return "bg-yellow-500";
    if (progressValue >= 25) return "bg-orange-500";
    return "bg-red-500";
  };
  const getPriorityColor = () => {
    console.log('getPriorityColor called with priority:', priority);
    switch (priority) {
      case "High":
        console.log('Returning High priority color');
        return "text-red-600 bg-red-50 border border-red-200";
      case "Medium":
        console.log('Returning Medium priority color');
        return "text-orange-600 bg-orange-50 border border-orange-200";
      case "Low":
        console.log('Returning Low priority color');
        return "text-gray-600 bg-gray-50 border border-gray-200";
      default:
        console.log('Returning default color for priority:', priority);
        return "text-gray-500 bg-gray-50 border border-gray-200";
    }
  };

  return (
    <div
      className="task-card p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs rounded ${getStatusTagColor()}`}>
            {status || "Unknown"}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${getPriorityColor()}`}>
            {priority || "None"}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 ${getProgressColor()}`}
            style={{ width: `${Math.min(Math.max(Number(progress) || 0, 0), 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>Due: {formatDate(dueDate)}</div>
          <div>Assigned: {getAssignedUserDisplay()}</div>
        </div>
      </div>

      {/* Optional Section for Attachments and Todo Count */}
      <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
        {attachmentCount > 0 && (
          <div className="flex items-center space-x-1">
            <LuPaperclip className="w-4 h-4 text-gray-500" />
            <span>{attachmentCount} Attachments</span>
          </div>
        )}
        {todoChecklist && completedTodoCount !== undefined && (
          <div className="flex items-center space-x-1">
            <span>{completedTodoCount}/{todoChecklist.length} Todos Completed</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default TaskCard;

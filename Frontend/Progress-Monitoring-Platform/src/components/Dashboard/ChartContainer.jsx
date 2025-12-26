import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';

const ChartContainer = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <FiMoreVertical />
        </button>
      </div>
      {children}
    </div>
  );
};

export default ChartContainer;

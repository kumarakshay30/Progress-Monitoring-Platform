import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ to = -1, className = '', children = 'Back' }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    if (to === -1) {
      navigate(-1);
    } else {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-gray-600 hover:text-gray-800 transition-colors ${className}`}
    >
      <FiArrowLeft className="mr-1" />
      {children}
    </button>
  );
};

export default BackButton;

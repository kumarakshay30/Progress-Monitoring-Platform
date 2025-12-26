import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon,
  Mail as MailIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  LogOut as LogOutIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon
} from 'lucide-react';

const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      // Replace with your actual API call
      // const response = await axiosInstance.put('/api/auth/change-password', {
      //   currentPassword,
      //   newPassword
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ 
        text: 'Password changed successfully!', 
        type: 'success' 
      });
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Hide the form after success
      setTimeout(() => {
        setShowChangePassword(false);
        setMessage({ text: '', type: '' });
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to change password', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <UserIcon className="w-5 h-5" />
        </div>
        <span className="font-medium text-gray-700">{user?.name || 'User'}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{user?.name || 'User'}</h3>
                <p className="text-xs text-gray-500">{user?.role || 'Member'}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <MailIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span className="truncate">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          
          {/* Change Password Form */}
          {showChangePassword && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h4 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                <LockIcon className="w-4 h-4 mr-2" />
                Change Password
              </h4>
              
              {message.text && (
                <div className={`mb-3 p-2 text-sm rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setMessage({ text: '', type: '' });
                    }}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="py-1">
            {!showChangePassword && (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/user/profile');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                  View Profile
                </button>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LockIcon className="w-4 h-4 mr-2 text-gray-500" />
                  Change Password
                </button>
              </>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;

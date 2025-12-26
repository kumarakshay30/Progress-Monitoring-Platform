import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get menu items based on user role
  const menuItems = useMemo(() => {
    // Always return a fresh copy of the appropriate menu
    if (user?.role === "admin") {
      return SIDE_MENU_DATA.filter(item => item.label !== "Logout");
    }
    // For non-admin users, only show user-specific menu items
    return SIDE_MENU_USER_DATA.filter(item => item.label !== "Logout");
  }, [user?.role]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen p-6 flex flex-col">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-blue-700 rounded w-3/4"></div>
          <div className="flex items-center space-x-4 p-3">
            <div className="h-12 w-12 rounded-full bg-blue-700"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-blue-700 rounded w-3/4"></div>
              <div className="h-3 bg-blue-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-2">
        <div className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent text-center">
          LearnTrack
        </div>
        
        {/* User Profile Section */}
        {user && (
          <div className="flex flex-col items-center p-5 bg-blue-700/50 rounded-xl backdrop-blur-sm space-y-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {user?.role === "admin" && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">{user?.name || 'User'}</h3>
              <p className="text-sm text-blue-100 mb-2">{user?.email || ''}</p>
              {user?.role && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`w-full text-left px-6 py-3 mb-2 rounded-lg flex items-center transition-colors ${
              activeMenu === item.label 
                ? "bg-blue-600 text-white" 
                : "text-blue-100 hover:bg-blue-700/50"
            }`}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-3 text-lg" />
            {item.label}
          </button>
        ))}
      </div>
      
      {/* Single Logout Button */}
      <div className="mt-auto py-4 border-t border-blue-800 sticky bottom-0 bg-gradient-to-b from-blue-900 to-blue-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-300 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SideMenu;
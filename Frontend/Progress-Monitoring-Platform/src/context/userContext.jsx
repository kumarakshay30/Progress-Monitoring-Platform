import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// Create the context
export const UserContext = createContext();

// Create a separate hook for using the context
export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch user profile
  const fetchUser = useCallback(async () => {
    const accessToken = localStorage.getItem("token");
    
    if (!accessToken) {
      setLoading(false);
      return null;
    }

    // Don't fetch if already fetching
    if (isFetching) return null;

    try {
      setIsFetching(true);
      setError(null);
      
      // Add the token to the headers with increased timeout
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // Increased timeout to 15 seconds
      };
      
      console.log('Fetching user profile...');
      const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE, config);
      
      if (!response.data) {
        throw new Error('No user data received');
      }
      
      // Ensure the user object has a role and consistent structure
      const userData = {
        ...response.data,
        role: (response.data.role || 'user').toLowerCase(), // Ensure lowercase for consistency
        token: accessToken
      };
      
      setUser(userData);
      console.log('User profile loaded successfully');
      return userData;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED') {
        console.log('Request timeout, retrying...');
        setError('Request timeout. Please check your connection and try again.');
        // Retry once after a delay
        setTimeout(() => {
          if (!user && !isFetching) {
            fetchUser();
          }
        }, 2000);
        return null;
      }
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('Authentication failed, logging out...');
        clearUser();
        // Redirect to login page
        window.location.href = '/login';
        return null;
      }
      
      // Handle network errors
      if (error.message === 'Network Error') {
        setError('Network error. Please check your internet connection.');
        return null;
      }
      
      setError(error.response?.data?.message || 'Failed to load user profile');
      return null;
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [isFetching, user]);

  // Initial user fetch on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!user && !isFetching) {
        fetchUser();
      }
    } else {
      setLoading(false);
    }
  }, [fetchUser, user, isFetching]);

  // Update user data
  const updateUser = useCallback(async (userData) => {
    if (!userData) return null;
    
    try {
      // If we have a token but no user data, fetch the full profile
      if (userData.token && !userData.id) {
        const profile = await fetchUser();
        return profile;
      }
      
      // Ensure we're storing the complete user object with role
      const userWithRole = {
        ...userData,
        role: (userData.role || 'user').toLowerCase() // Ensure lowercase for consistency
      };
      
      setUser(userWithRole);
      
      // Update token if provided
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      }
      
      setLoading(false);
      return userWithRole;
    } catch (error) {
      console.error('Failed to update user:', error);
      clearUser();
      return null;
    }
  }, [fetchUser]);

  // Clear user data and token
  const clearUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, credentials);
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const userData = await fetchUser();
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    clearUser();
    // You might want to add a logout API call here if needed
    // await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    updateUser,
    clearUser,
    login,
    logout,
    refreshUser: fetchUser
  }), [user, loading, error, fetchUser]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Export the hook that uses the context
export { useUserContext as useUser };

// Default export the provider
export default UserProvider;
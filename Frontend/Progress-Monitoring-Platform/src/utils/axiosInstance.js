import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Base URL without /api since it's included in the paths
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies if using them for auth
});

// Request interceptor to add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    // Skip adding token for login/register requests
    if (!config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Auth token attached to request');
      } else {
        console.warn('No auth token found in localStorage');
        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
          window.location.href = '/login';
        }
        return Promise.reject(new Error('No authentication token found'));
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Set up request tracking
const pendingRequests = new Map();

const getRequestKey = (config) => {
  return [
    config.method,
    config.url,
    JSON.stringify(config.params),
    JSON.stringify(config.data),
  ].join('&');
};

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Clean up the request from pending requests
    if (response.config) {
      const requestKey = getRequestKey(response.config);
      pendingRequests.delete(requestKey);
      console.log('Request successful:', response.config.url);
    }
    return response;
  },
  (error) => {
    // Clean up the request from pending requests even on error
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    const originalRequest = error.config;
    
    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Please try again later.');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        // Clear any existing token
        localStorage.removeItem('token');
        // Store the current path to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        // Redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response?.data?.message) {
      console.error('Server error:', error.response.data.message);
    } else if (error.request) {
      console.error('No response from server. Please check your connection.');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
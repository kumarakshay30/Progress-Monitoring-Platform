// This utility handles CSRF token management for API requests

// Get CSRF token from cookies
export const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// Add CSRF token to all axios requests
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = getCSRFToken();
  if (token && !config.headers['X-CSRFToken']) {
    config.headers['X-CSRFToken'] = token;
  }
  return config;
});

export default {
  getCSRFToken,
};

import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const PrivateRoute = ({ allowedRoles = [], children }) => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Only store the path if user is not logged in
    if (!loading && !user) {
      const currentPath = location.pathname;
      if (!['/login', '/signup', '/'].includes(currentPath)) {
        console.log('Storing redirect path:', currentPath);
        sessionStorage.setItem('redirectAfterLogin', currentPath);
      }
    }
    setIsInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Show loading state only on initial load
  if (loading || isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user is found, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0) {
    const userRole = (user.role || 'user').toLowerCase();
    const hasRequiredRole = allowedRoles.some(role => 
      role.toLowerCase() === userRole || 
      (userRole === 'admin' && role.toLowerCase() === 'user') || 
      (userRole === 'member' && role.toLowerCase() === 'user') || 
      (userRole === 'user' && role.toLowerCase() === 'member')
    );

    if (!hasRequiredRole) {
      console.log(`User role ${userRole} not in allowed roles:`, allowedRoles);
      const fallback = userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  // If we have children, render them, otherwise render the Outlet
  if (children) {
    return typeof children === 'function' ? children({ user }) : children;
  }
  return <Outlet />;

};

export default PrivateRoute;
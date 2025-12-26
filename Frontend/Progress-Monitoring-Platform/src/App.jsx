import React, { Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserProvider } from './context/userContext';
import { UsersProvider } from './context/usersContext';
import NavBar from './components/layouts/NavBar';
import PrivateRoute from './routes/PrivateRoute';
import Loader from './components/common/Loader';
import BackButton from './components/common/BackButton';
import SideMenu from './components/layouts/SideMenu';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load components with webpackChunkName for better code splitting
const Login = React.lazy(() => import(/* webpackChunkName: "auth" */ './pages/Auth/Login'));
const SignUp = React.lazy(() => import(/* webpackChunkName: "auth" */ './pages/Auth/SignUp'));
const UserDashboard = React.lazy(() => import(/* webpackChunkName: "user" */ './pages/User/UserDashboard'));
const Profile = React.lazy(() => import(/* webpackChunkName: "user" */ './pages/User/Profile'));
const ChangePassword = React.lazy(() => import(/* webpackChunkName: "user" */ './pages/User/ChangePassword'));
const UserManageTasks = React.lazy(() => import(/* webpackChunkName: "user" */ './pages/User/UserManageTasks'));
const TaskDetail = React.lazy(() => import(/* webpackChunkName: "user" */ './pages/User/TaskDetail'));
const Dashboard = React.lazy(() => import(/* webpackChunkName: "admin" */ './pages/Admin/Dashboard'));
const CreateTask = React.lazy(() => import(/* webpackChunkName: "admin-tasks" */ './pages/Admin/CreateTask'));
const TaskDetails = React.lazy(() => import(/* webpackChunkName: "admin-tasks" */ './pages/Admin/TaskDetails'));
const ManageTasks = React.lazy(() => import(/* webpackChunkName: "admin-tasks" */ './pages/Admin/ManageTasks.jsx'));
const ManageUsers = React.lazy(() => import(/* webpackChunkName: "admin-users" */ './pages/Admin/ManageUsers'));
const AddUser = React.lazy(() => import(/* webpackChunkName: "admin-users" */ './pages/Admin/AddUser'));
const EditUser = React.lazy(() => import(/* webpackChunkName: "admin-users" */ './pages/Admin/EditUser'));

// Main layout component that includes the NavBar and content area
const MainLayout = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <NavBar />}
      <main className="container mx-auto px-4 py-6">
        <Suspense fallback={<Loader />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
};

// Wrapper component for admin routes
const AdminLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin/dashboard';
  const isTaskDetails = location.pathname.startsWith('/admin/tasks/');
  
  // Get active menu based on current path
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('tasks') && !path.includes('create')) return 'Manage Tasks';
    if (path.includes('create-task') || (path.includes('edit') && path.includes('tasks'))) return 'Create Task';
    if (path.includes('users')) return 'Users';
    return '';
  };
  
  // Check if we should show the back button
  const shouldShowBackButton = !isDashboard && !isTaskDetails;
  
  return (
    <PrivateRoute allowedRoles={['admin']}>
      <div className="flex h-screen bg-gray-100">
        <SideMenu activeMenu={getActiveMenu()} />
        <div className="flex-1 overflow-auto bg-gray-50">
          {shouldShowBackButton && (
            <div className="container mx-auto px-4 pt-4">
              <BackButton to="/admin/dashboard" className="mb-4" />
            </div>
          )}
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

// Wrapper component for user routes
const UserLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/user/dashboard';
  const isTaskDetails = location.pathname.startsWith('/user/tasks/');
  
  return (
    <PrivateRoute allowedRoles={['member', 'user']}>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="container mx-auto px-4 py-6">
          {!isDashboard && !isTaskDetails && (
            <div className="mb-4">
              <BackButton to="/user/dashboard" />
            </div>
          )}
          {isTaskDetails && (
            <div className="mb-4">
              <BackButton to="/user/dashboard" />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </PrivateRoute>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <UserProvider>
          <UsersProvider>
            <Suspense fallback={<Loader fullScreen />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Tasks Routes */}
                  <Route path="tasks">
                    <Route index element={<ManageTasks />} />
                    <Route path="create" element={<CreateTask />} />
                    <Route path=":id" element={<TaskDetails />} />
                    <Route path=":id/edit" element={<CreateTask />} />
                  </Route>
                  
                  {/* Users Routes */}
                  <Route path="users">
                    <Route index element={<ManageUsers />} />
                    <Route path="add" element={<AddUser />} />
                    <Route path="edit/:userId" element={<EditUser />} />
                  </Route>
                  
                  {/* User Profile Routes */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>
                
                {/* User Routes */}
                <Route path="/user" element={<UserLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="tasks" element={<UserManageTasks />} />
                  <Route path="tasks/:id" element={<TaskDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>
                
                {/* Root redirect based on role */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <Navigate to="/user/dashboard" replace />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch all other routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </UsersProvider>
        </UserProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
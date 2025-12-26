import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SideMenu from "./SideMenu";
import NavBar from "./NavBar";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if current route is the main dashboard
  const isMainDashboard = location.pathname === '/admin/dashboard' || location.pathname === '/user/dashboard';

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar activeMenu={activeMenu} />

      {user && (
        <div className="flex flex-1 overflow-hidden">
          <div className="max-[1080px]:hidden flex-shrink-0">
            <SideMenu activeMenu={activeMenu} />
          </div>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full">
              {!isMainDashboard && (
                <button
                  onClick={handleGoBack}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="mr-2" />
                  <span>Back</span>
                </button>
              )}
              <div className="h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

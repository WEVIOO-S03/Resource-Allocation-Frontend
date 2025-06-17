// components/Sidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faUsers, 
  faFolderOpen,
  faCog,
  faSignOutAlt,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentUser, logout } from '../../api/authService';
import logo from '../../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const currentUser = getCurrentUser();
  
  const userInitials = currentUser ? 
    `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase() 
    : 'U';

  const roles = currentUser?.roles || [];
  const userRoles = Array.isArray(roles) ? roles : Object.values(roles);
  const isAdmin = userRoles.includes('ROLE_ADMIN');

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      // The page will reload automatically in the logout function
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sidebar w-64 fixed inset-y-0 left-0 z-30 overflow-y-auto text-white 
              bg-gradient-to-b from-slate-800 to-slate-700">
      <div className="px-4 pt-4 ">
        <div className="flex items-center justify-center mb-2">
          <img src={logo} alt="Logo" className="h-16 w-50" />
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-b border-slate-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
            {userInitials}
          </div>
          <div className="ml-3">
            <p className="font-medium">{isAdmin ? 'Admin User' : currentUser?.firstName}</p>
            <p className="text-xs opacity-75">{currentUser?.email || 'user@example.com'}</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 py-4">
        <h3 className="text-xs uppercase tracking-wider opacity-75 px-2 mb-2">Main</h3>
        <Link to={isAdmin ? "/admin" : "/projects"} className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faTachometerAlt} className="w-6" />
          <span>Dashboard</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className="sidebar-link active flex items-center py-2 px-2 rounded-lg mb-1 text-white">
            <FontAwesomeIcon icon={faUsers} className="w-6" />
            <span>Users</span>
          </Link>
        )}
        <Link to="/projects" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faFolderOpen} className="w-6" />
          <span>Projects</span>
        </Link>
        <Link to="/resources" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-6" />
          <span>Time & Attendance</span>
        </Link>
        
        <h3 className="text-xs uppercase tracking-wider opacity-75 px-2 mb-2 mt-6">Settings</h3>
        <Link to="/settings" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faCog} className="w-6" />
          <span>Settings</span>
        </Link>
        <a href="#" onClick={handleLogout} className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
          <span>Logout</span>
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
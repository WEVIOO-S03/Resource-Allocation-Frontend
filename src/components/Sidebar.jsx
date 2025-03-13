// components/Sidebar.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt,
  faUsers,
  faFolderOpen,
  faCog,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = () => {
  return (
    <div className="sidebar w-64 fixed inset-y-0 left-0 z-30 overflow-y-auto text-white"
      style={{ background: 'linear-gradient(180deg, #4f46e5 0%, #7c3aed 100%)' }}>
      <div className="px-6 pt-8 pb-4">
        <h2 className="text-2xl font-bold">ProjManage</h2>
        <p className="text-sm opacity-75">Admin Dashboard</p>
      </div>
      
      <div className="px-6 py-4 border-t border-b border-indigo-800">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
            AD
          </div>
          <div className="ml-3">
            <p className="font-medium">Admin User</p>
            <p className="text-xs opacity-75">admin@example.com</p>
          </div>
        </div>
      </div>
      
      <nav className="px-4 py-4">
        <h3 className="text-xs uppercase tracking-wider opacity-75 px-2 mb-2">Main</h3>
        <a href="#" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faTachometerAlt} className="w-6" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="sidebar-link active flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faUsers} className="w-6" />
          <span>Users</span>
        </a>
        <a href="#" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faFolderOpen} className="w-6" />
          <span>Projects</span>
        </a>
        
        <h3 className="text-xs uppercase tracking-wider opacity-75 px-2 mb-2 mt-6">Settings</h3>
        <a href="#" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faCog} className="w-6" />
          <span>Settings</span>
        </a>
        <a href="#" className="sidebar-link flex items-center py-2 px-2 rounded-lg mb-1 text-white">
          <FontAwesomeIcon icon={faSignOutAlt} className="w-6" />
          <span>Logout</span>
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
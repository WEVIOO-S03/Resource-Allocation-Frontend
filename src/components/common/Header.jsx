// components/Header.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBell,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import { logout, getCurrentUser } from '../../api/authService';

const Header = ({ title }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const currentUser = getCurrentUser();
  const userInitials = currentUser?.email ? 
    currentUser.email.split('@')[0].substring(0, 2).toUpperCase() : 'US';

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>

          <div className="flex items-center space-x-4">
            
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100 focus:outline-none">
                <FontAwesomeIcon icon={faBell} className="text-gray-600" />
                <span className="notification-badge flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">3</span>
              </button>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center focus:outline-none"
                onClick={toggleUserDropdown}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-300 flex items-center justify-center text-slate-700 font-bold">
                  {userInitials}
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-slate-600" />
              </button>

              <div 
                className={`dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 ${
                  userDropdownOpen ? 'block' : 'hidden'
                }`}
              >
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-50">Profile</a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-indigo-50">Settings</a>
                <div className="border-t border-gray-200 my-1"></div>
                <a href="#" onClick={handleLogout} className="block px-4 py-2 text-gray-800 hover:bg-indigo-50">Logout</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
// pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCheckCircle,
  faClock,
  faFolder
} from '@fortawesome/free-solid-svg-icons';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/Cards';
import UserTable from '../components/UserTable';
import Pagination from '../components/Pagination';


import { fetchUsers, createUser, getDashboardStats } from '../api/userService';

const AdminDashboard = () => {

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
 
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalProjects: 0
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
    
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
        
      
        const response = await fetchUsers(currentPage, itemsPerPage);
        setUsers(response.users);
        setTotalUsers(response.total);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, itemsPerPage]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const statsCards = [
    {
      icon: faUsers,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Total Users',
      value: stats.totalUsers,
      delay: 0.1
    },
    {
      icon: faCheckCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Active Users',
      value: stats.activeUsers,
      delay: 0.2
    },
    {
      icon: faClock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      title: 'Pending Users',
      value: stats.pendingUsers,
      delay: 0.3
    },
    {
      icon: faFolder,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: 'Projects',
      value: stats.totalProjects,
      delay: 0.4
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header Component */}
        <Header title="User Management" />

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <StatsCard
                key={index}
                icon={card.icon}
                iconColor={card.iconColor}
                bgColor={card.bgColor}
                title={card.title}
                value={card.value}
                delay={card.delay}
              />
            ))}
          </div>
          
          {/* User List Section */}
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <>
              <UserTable users={users}  />
              <Pagination
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .sidebar {
          transition: all 0.3s ease;
        }
        .sidebar-link {
          transition: all 0.3s ease;
        }
        .sidebar-link:hover, .sidebar-link.active {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }
        .card {
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .btn-primary {
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }
        .status-badge {
          transition: all 0.3s ease;
        }
        .status-badge:hover {
          transform: scale(1.05);
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .user-row {
          transition: all 0.3s ease;
        }
        .user-row:hover {
          background-color: rgba(79, 70, 229, 0.05);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
        }
        .dropdown-menu {
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(-10px);
          pointer-events: none;
        }
        .dropdown-menu.active {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .search-input {
          transition: all 0.3s ease;
        }
        .search-input:focus {
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .pulse {
          animation: pulse 2
      }`}</style>
    </div>
  );
};

export default AdminDashboard;
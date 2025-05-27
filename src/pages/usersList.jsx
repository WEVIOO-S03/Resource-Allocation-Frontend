import React, { useState, useEffect } from 'react';
import { faUsers, faCheckCircle, faClock, faFolder, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


import StatsCard from '../components/Cards';
import UserTable from '../components/UserTable';
import Pagination from '../components/common/Pagination';
import Layout from '../components/common/Layout';


import { fetchUsers } from '../api/userService';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalProjects: 0
  });

  // Function to fetch all dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchUsers(currentPage, itemsPerPage);
      
      if (response.error) {
        setError(response.error);
        setUsers([]);
        setTotalUsers(0);
        return;
      }
      
      setUsers(response.users || []);
      setTotalUsers(response.total || 0);
      
      if (response.users && Array.isArray(response.users)) {
        const activeUsers = response.users.filter(user => user.status === 'Approved').length;
        const pendingUsers = response.users.filter(user => user.status === 'Pending').length;
        let totalProjects = 0;
        response.users.forEach(user => {
          if (user.projects && Array.isArray(user.projects)) {
            totalProjects += user.projects.length;
          } else if (typeof user.projects === 'number') {
            totalProjects += user.projects;
          }
        });
        
            setStats({
              totalUsers: response.total || response.users.length,
              activeUsers,
              pendingUsers,
              totalProjects
            });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          setError(error.message || 'Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      };

      useEffect(() => {
        fetchData();
      }, [currentPage, itemsPerPage]);

      const handlePageChange = (page) => {
        setCurrentPage(page);
      };

      const handleUserStatusChange = async (userId, newStatus) => {
        // Update UI optimistically
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        );
        setUsers(updatedUsers);
        
        // Update stats
        if (newStatus === 'Active') {
          setStats({
            ...stats,
            activeUsers: stats.activeUsers + 1,
            pendingUsers: stats.pendingUsers - 1
          });
        } else if (newStatus === 'Inactive') {
          setStats({
            ...stats,
            pendingUsers: stats.pendingUsers - 1
          });
        }
        
        // Refresh data after a short delay to ensure backend sync
        setTimeout(() => {
          fetchData();
        }, 1000);
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

      // Error display component
      const ErrorMessage = ({ message }) => (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">There was an error loading the data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{message}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 font-medium"
                  onClick={fetchData}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );

      return (
        <Layout title="Users Management">

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
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="mt-2 text-gray-500">Loading...</p>
                </div>
              ) : error ? (
                <ErrorMessage message={error} />
              ) : (
                <>
                  <UserTable 
                    users={users} 
                    onStatusChange={handleUserStatusChange} 
                  />
                  <Pagination
                    totalItems={totalUsers}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </>
              )}
            </main>
          
        </Layout>
      );
    };

export default AdminDashboard;
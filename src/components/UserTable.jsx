// components/UserTable.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faChevronDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../api/userService'; 

const UserRow = ({ user, onUserDeleted }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'Pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const statusColors = getStatusColor(user.status.charAt(0).toUpperCase() + user.status.slice(1));

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  };

  const handleManageProjectRights = () => {
    navigate(`/edituser/${user.id}`);
    setShowActions(false);
  };

  const toggleActionsMenu = () => {
    setShowActions(!showActions);
  };

  const handleDeleteClick = () => {
    setShowActions(false);
    setShowDeleteConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteUser(user.id);
      setShowDeleteConfirm(false);
      if (onUserDeleted) {
        onUserDeleted(user.id);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && !event.target.closest('.actions-menu-container')) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  return (
    <>
      <tr className="user-row hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full ${statusColors.bg} flex items-center justify-center text-gray-600 font-bold`}>
              {getInitials(user.name)}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">
                {user.position ? user.position : '(No position set)'}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{user.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}>
            {user.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {Array.isArray(user.projects) ? user.projects.length : 0}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.created}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="relative actions-menu-container">
            <button 
              onClick={toggleActionsMenu} 
              className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Open actions menu"
              aria-expanded={showActions}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleManageProjectRights}
                >
                  Edit User
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleManageProjectRights}
                >
                  Manage Project Rights
                </button>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">
              Are you sure you want to delete user <span className="font-semibold">{user.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const UserTable = ({ users = [], onUserDeleted }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    setFilteredUsers(
      statusFilter === 'All' 
        ? users 
        : users.filter(user => user.status === statusFilter)
    );
  }, [statusFilter, users]);

  const handleUserDeleted = (userId) => {
    if (!onUserDeleted) {
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
    } else {
      onUserDeleted(userId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate__animated animate__fadeInUp" style={{ animationDelay: '0.5s' }}>
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">User List</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <select 
                className="bg-gray-100 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <button 
              className="btn-primary flex items-center text-white rounded-lg px-4 py-2"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
              aria-label="Advanced filters"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filter.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onUserDeleted={handleUserDeleted} 
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserTable;

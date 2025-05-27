// api/userService.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

export const getAuthToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('token');
  }
  return null;
};

export const fetchUsers = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
    
    const data = await response.json();
   
    console.log('User statuses from DB:', data.map(user => user.status));

    const formattedUsers = data.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status === 'pending' ? 'Pending' : 
              user.status === 'approved' ? 'Approved' : 'Inactive',
      projects: user.projects, 
      position: user.position,
      skills: user.skills,
      created: new Date(user.createdAt).toLocaleDateString(),
      role: user.roles && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN') 
            ? 'Administrator' 
            : 'User'
    }));

    console.log('Formatted statuses:', formattedUsers.map(user => user.status));
    return {
      users: formattedUsers,
      total: formattedUsers.length 
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return {
      users: [],
      total: 0,
      error: error.message
    };
  }
};

export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const users = await fetchUsers(1, 1000); 
      const totalUsers = users.users.length;
      const activeUsers = users.users.filter(user => user.status === 'Active').length;
      const pendingUsers = users.users.filter(user => user.status === 'Pending').length;
      
      return {
        totalUsers,
        activeUsers,
        pendingUsers,
        totalProjects: 0 
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0,
      totalProjects: 0
    };
  }
};

export const updateUserAccess = async (userId, data) => {
  try {
    console.log(`Sending update access request for user ${userId}:`, data);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/update-access`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update user access: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user access:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const fetchUserProjects = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user projects: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', await response.text());
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
};
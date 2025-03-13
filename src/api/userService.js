

const API_URL = 'https://api.example.com';

// Function to fetch all users
export const fetchUsers = async (page = 1, limit = 10, filters = {}) => {
  try {
    
    return {
      users: [
        {
          id: 1,
          name: 'Manel',
          email: 'Manel@example.com',
          role: 'Senior Developer',
          status: 'Active',
          projects: 5,
          created: 'Jan 10, 2023'
        },
        {
          id: 2,
          name: 'Manel',
          email: 'Manel@example.com',
          role: 'UX Designer',
          status: 'Pending',
          projects: 3,
          created: 'Feb 15, 2023'
        },
        {
          id: 3,
          name: 'Manel',
          email: 'Manel@example.com',
          role: 'Project Manager',
          status: 'Inactive',
          projects: 0,
          created: 'Mar 5, 2023'
        }
      ],
      total: 24,
      page: page,
      limit: limit
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Function to create a new user
export const createUser = async (userData) => {
  try {
    console.log('Creating user:', userData);
    return {
      id: Math.floor(Math.random() * 1000),
      ...userData,
      status: 'Pending',
      projects: 0,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Function to update an existing user
export const updateUser = async (userId, userData) => {
  try {
    console.log('Updating user:', userId, userData);
    return {
      id: userId,
      ...userData
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Function to delete a user
export const deleteUser = async (userId) => {
  try {
    console.log('Deleting user:', userId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Function to get dashboard statistics
export const getDashboardStats = async () => {
  try {
    return {
      totalUsers: 24,
      activeUsers: 18,
      pendingUsers: 6,
      totalProjects: 12
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

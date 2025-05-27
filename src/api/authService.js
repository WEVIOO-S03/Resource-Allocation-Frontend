import { getAuthToken } from './userService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return {
      success: true,
      data: data,
      isAdmin: Array.isArray(data.user.roles) && data.user.roles.includes('ROLE_ADMIN')
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}. Not a JSON response.`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      let errorMessage = 'Registration failed';
      
      if (data.errors) {
        errorMessage = Object.values(data.errors).join(', ');
      } else if (data.error) {
        errorMessage = data.error;
      }
      
      throw new Error(errorMessage);
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    window.location.reload();
    
    return false;
  }
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    localStorage.removeUser('user');
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getAuthToken() && !!getCurrentUser();
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN');
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
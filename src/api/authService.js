import { getAuthToken } from './userService';

export const logout = async () => {
    try {
      const response = await fetch('http://localhost:8000/logout', {
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
      localStorage.removeItem('user');
      return null;
    }
  };
  
  export const isAuthenticated = () => {
    return !!getAuthToken() && !!getCurrentUser();
  };
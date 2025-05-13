import { format, startOfWeek, endOfWeek } from 'date-fns';

const API_URL = 'http://localhost:8000/api';

export const ProjectService = {
  getAuthToken() {
    return localStorage.getItem('token');
  },

  async fetchProject(projectId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project data:', error);
      throw error;
    }
  },

  async fetchAvailableResources() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.map(resource => ({
        ...resource,
        poleName: resource.pole ? resource.pole.name : 'No Department',
      }));
    } catch (error) {
      console.error('Error fetching available resources:', error);
      throw error;
    }
  },

  async fetchOccupationRecords(startDate, endDate, projectId) {
  try {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const formattedStartDate = format(startOfWeek(startDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const formattedEndDate = format(endOfWeek(endDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    const response = await fetch(
      `${API_URL}/resources/occupation-records?startDate=${formattedStartDate}&endDate=${formattedEndDate}&projectId=${projectId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    const recordsMap = {};
    if (Array.isArray(data)) {
      data.forEach(record => {
        if (record.resourceId && record.weekStart && record.weekEnd) {
          const startDate = new Date(record.weekStart);
          const endDate = new Date(record.weekEnd);
          let currentDate = new Date(startDate);
          
          while (currentDate <= endDate) {
            recordsMap[`${record.resourceId}-${format(currentDate, 'yyyy-MM-dd')}`] = {
              rate: record.occupationRate,
              updatedAt: record.updatedAt,
              updatedBy: record.updatedBy,
              weekStart: record.weekStart,
              weekEnd: record.weekEnd
            };
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });
    }
    
    return recordsMap;
  } catch (error) {
    console.error('Error fetching occupation records:', error);
    throw error;
  }
},

  async assignResourceToProject(projectId, resourceId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/projects/${projectId}/resources/${resourceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to assign resource');
      }

      return await this.fetchProject(projectId);
    } catch (error) {
      console.error('Error assigning resource:', error);
      throw error;
    }
  },

  async removeResourceFromProject(projectId, resourceId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/projects/${projectId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove resource');
      }
      
      try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const weekStarts = [];
        let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
        while (currentWeekStart <= endDate) {
          weekStarts.push(new Date(currentWeekStart));
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        
        for (const weekStart of weekStarts) {
          await this.updateOccupationRate(resourceId, projectId, weekStart, 0);
        }
      } catch (error) {
        console.warn('Failed to clear occupation records, but resource was removed from project');
      }

      return true;
    } catch (error) {
      console.error('Error removing resource:', error);
      throw error;
    }
  },

  async updateOccupationRate(resourceId, projectId, date, rate) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const formattedWeekStart = format(weekStart, 'yyyy-MM-dd');

      const response = await fetch(`${API_URL}/resources/${resourceId}/projects/${projectId}/occupation-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formattedWeekStart, 
          occupationRate: rate
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to update occupation rate');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating occupation rate:', error);
      throw error;
    }
  },
  
  async resetResourceOccupation(resourceId, projectId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_URL}/resources/${resourceId}/projects/${projectId}/reset-occupation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset resource occupation rates');
      }
      
      return true;
    } catch (error) {
      console.error('Error resetting resource occupation:', error);
      throw error;
    }
  }
};

export default ProjectService;
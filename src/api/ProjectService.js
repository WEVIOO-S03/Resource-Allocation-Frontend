import { format } from 'date-fns';

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

      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
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
      
      console.log('data:', data);
      const recordsMap = {};
      if (Array.isArray(data)) {
        data.forEach(record => {
          if (record.resourceId && record.date) {
            recordsMap[`${record.resourceId}-${record.date}`] = {
              rate: record.occupationRate,
              updatedAt: record.updatedAt,
              updatedBy: record.updatedBy
            };
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

      const formattedDate = format(date, 'yyyy-MM-dd');

      const response = await fetch(`${API_URL}/resources/${resourceId}/projects/${projectId}/occupation-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: formattedDate,
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
  }
};

export default ProjectService;
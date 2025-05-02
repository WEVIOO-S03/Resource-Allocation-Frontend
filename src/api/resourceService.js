import { format } from 'date-fns';

const API_URL = 'http://localhost:8000/api';

class ResourceService {
  static async getAllResources(date = null) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const url = new URL(`${API_URL}/resources`);
      if (date) {
        url.searchParams.append('date', date);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }
  
  static async getResourceDetails(resourceId) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const response = await fetch(`${API_URL}/resources/${resourceId}`, {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching resource ${resourceId}:`, error);
      throw error;
    }
  }

  static async updateResourceOccupation(resourceId, date, occupationRate) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${API_URL}/resources/${resourceId}/occupation`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          date,
          occupationRate
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating resource occupation:', error);
      throw error;
    }
  }
  
  static async getOccupationRecords(startDate, endDate, projectId = null, resourceId = null) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      
      const formattedStartDate = startDate instanceof Date ? format(startDate, 'yyyy-MM-dd') : startDate;
      const formattedEndDate = endDate instanceof Date ? format(endDate, 'yyyy-MM-dd') : endDate;
      
      let url = new URL(`${API_URL}/resources/occupation-records`);
      url.searchParams.append('startDate', formattedStartDate);
      url.searchParams.append('endDate', formattedEndDate);
      
      if (projectId) {
        url.searchParams.append('projectId', projectId);
      }
      
      if (resourceId) {
        url.searchParams.append('resourceId', resourceId);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const recordsMap = {};
      if (Array.isArray(data)) {
        data.forEach(record => {
          if (record.resourceId && record.date && record.projectId) {
            recordsMap[`${record.resourceId}-${record.projectId}-${record.date}`] = {
              rate: record.occupationRate,
              updatedAt: record.updatedAt,
              updatedBy: record.updatedBy
            };
          }
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
  }
  
  static async updateOccupationRate(resourceId, projectId, date, rate) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const formattedDate = date instanceof Date ? format(date, 'yyyy-MM-dd') : date;
      
      const response = await fetch(`${API_URL}/resources/${resourceId}/projects/${projectId}/occupation-records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          date: formattedDate,
          occupationRate: rate
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update occupation rate');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating occupation rate:', error);
      throw error;
    }
  }
}

export default ResourceService;
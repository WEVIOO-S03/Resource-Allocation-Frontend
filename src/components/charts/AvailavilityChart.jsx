import React, { useState, useEffect } from 'react';
import ResourceService from '../../api/resourceService'; 

const AvailabilityChart = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getColorClass = (availability) => {
    if (availability >= 80) return 'bg-green-500';
    if (availability >= 60) return 'bg-blue-500';
    if (availability >= 40) return 'bg-yellow-500';
    if (availability >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getColorHex = (colorClass) => {
    const colorMap = {
      'bg-green-500': '#10B981',
      'bg-blue-500': '#3B82F6',
      'bg-yellow-500': '#EAB308',
      'bg-orange-500': '#F97316',
      'bg-red-500': '#EF4444'
    };
    return colorMap[colorClass] || '#3B82F6';
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ResourceService.getAllResources();
      
      const chartData = data.map(resource => ({
        name: resource.fullName || 'Unknown',
        percentage: resource.availability || 0,
        color: getColorClass(resource.availability || 0),
        totalOccupation: resource.totalOccupation || 0,
        warning: resource.warning || null
      }));

      chartData.sort((a, b) => b.percentage - a.percentage);

      setResources(chartData);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleRefresh = async () => {
    await fetchResources();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Availability Rate</h3>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex items-center animate-pulse">
              <div className="w-3 h-3 rounded-full mr-2 bg-gray-300"></div>
              <div className="w-28 h-4 bg-gray-300 rounded mr-2"></div>
              <div className="flex-grow h-8 flex items-center">
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="ml-2 w-12 h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Availability Rate</h3>
          <button 
            onClick={handleRefresh}
            className="text-sm text-blue-600 flex items-center hover:text-blue-800"
          >
            Retry
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">{error}</p>
          <button 
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Click to retry
          </button>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Availability Rate</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No resources found</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...resources.map(resource => resource.percentage), 100);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Availability Rate</h3>
        <button 
          onClick={handleRefresh}
          className="text-sm text-blue-600 flex items-center hover:text-blue-800"
        >
          Refresh
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <div key={`${resource.name}-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: getColorHex(resource.color) }}
            ></div>
            <span className="text-sm text-gray-600 w-28 truncate" title={resource.name}>
              {resource.name}
            </span>
            <div className="flex-grow h-8 flex items-center relative">
              <div
                className={`h-2 rounded ${resource.color}`}
                style={{ width: `${Math.min((resource.percentage / maxValue) * 100, 100)}%` }}
              ></div>
              {resource.warning && (
                <div className="absolute right-0 top-0">
                  <svg 
                    className="w-4 h-4 text-yellow-500" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    title={resource.warning}
                  >
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <span className="ml-2 text-sm font-medium">
              {resource.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      
      {resources.length > 6 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Show More Resources
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChart;
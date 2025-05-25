import React, { useState, useEffect } from 'react';

import ResourceService from '../../api/resourceService'; 

const OccupationChart = ({ selectedDate = null, maxResults = 5 }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getColorClass = (percentage) => {
    if (percentage >= 80) return 'bg-red-400'; 
    if (percentage >= 50) return 'bg-blue-300'; 
    return 'bg-green-400'; 
  };

  const calculateWorkingDays = (percentage) => {
    const daysInWeek = 5;
    const workingDays = Math.round((percentage / 100) * daysInWeek);
    return `${workingDays} day${workingDays !== 1 ? 's' : ''}`;
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ResourceService.getAllResources(selectedDate);     
      const transformedData = data
        .map(resource => ({
          id: resource.id,
          name: resource.fullName,
          percentage: Math.min(resource.occupation.rawTotal, 100), 
          rawPercentage: resource.occupation.rawTotal,
          color: getColorClass(resource.occupation.rawTotal),
          days: calculateWorkingDays(Math.min(resource.occupation.rawTotal, 100)),
          isOverallocated: resource.occupation.rawTotal > 100
        }))
        .sort((a, b) => b.rawPercentage - a.rawPercentage)
        .slice(0, maxResults);

      setResources(transformedData);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load occupation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedDate]);

  const handleRefresh = () => {
    fetchResources();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Occupation Rate</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center animate-pulse">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="flex-grow mx-2">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-gray-800">Occupation Rate</h3>
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
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const maxPercentage = 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-800">Occupation Rate</h3>
          <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="text-sm text-gray-500 hover:text-gray-700"
            title="Refresh data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="text-sm text-blue-600 flex items-center hover:text-blue-800">
            See All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div key={resource.id} className="flex items-center">
              <span className="text-sm text-gray-600 w-20 truncate" title={resource.name}>
                {resource.name.split(' ')[0]}
              </span>
              <div className="flex-grow h-8 flex items-center mx-2">
                <div className="relative flex-grow">
                  <div
                    className={`h-4 rounded ${resource.color} transition-all duration-300`}
                    style={{ width: `${(resource.percentage / maxPercentage) * 100}%` }}
                  ></div>
                  {resource.isOverallocated && (
                    <div className="absolute top-0 right-0 w-2 h-4 bg-red-600 rounded-r"></div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <span className="ml-2 text-sm font-medium">
                  {resource.rawPercentage}%
                </span>
                {resource.isOverallocated && (
                  <svg className="w-4 h-4 ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Over-allocated">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No resources found
          </div>
        )}
      </div>

      <div className="flex mt-6 space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-400 mr-2"></div>
          <span className="text-xs">Low (0-49%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-blue-300 mr-2"></div>
          <span className="text-xs">Fine (50-79%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-400 mr-2"></div>
          <span className="text-xs">High (80%+)</span>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-2 text-xs text-gray-500">
          Data for week of: {new Date(selectedDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default OccupationChart;
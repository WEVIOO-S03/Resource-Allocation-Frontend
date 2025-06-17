import React, { useState, useEffect } from 'react';
import ResourcesCalendar from '../components/ResourcesCalendar';
import ResourceService from '../api/resourceService';
import Layout from '../components/common/Layout';


const ResourcesPage = () => {
  const [loading, setLoading] = useState(true);
  const [resourceStats, setResourceStats] = useState({
    total: 0,
    available: 0,
    overallocated: 0
  });

  useEffect(() => {
    fetchResourceStats();
  }, []);

  const fetchResourceStats = async () => {
    try {
      setLoading(true);
      const resources = await ResourceService.getAllResources();
      
      const stats = {
        total: resources.length,
        available: resources.filter(r => r.availability > 20).length,
        overallocated: resources.filter(r => r.occupation?.rawTotal > 100).length
      };
      
      setResourceStats(stats);
    } catch (error) {
      console.error('Error fetching resource stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="General occupation rate calendar">

    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">        
        {!loading && (
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <span className="font-bold">{resourceStats.total}</span> Total Resources
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="font-bold">{resourceStats.available}</span> Available
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              <span className="font-bold">{resourceStats.overallocated}</span> Overallocated
            </div>
          </div>
        )}
      </div>
      
     
      
      <ResourcesCalendar />
    </div>
    </Layout>
  );
};

export default ResourcesPage;
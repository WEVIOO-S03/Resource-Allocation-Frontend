import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/AttendanceView.css';
import Layout from '../components/Layout';
import DashboardHeader from '../components/DashboardHeader'; 
import PerformanceCard from '../components/PerformanceStat'; 
import AvailabilityChart from '../components/AvailavilityChart';
import OccupationChart from '../components/OccupationChart';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ProjectService from '../api/ProjectService';

const ProjectDetails = () => {
  const { id } = useParams();
  const [projectResources, setProjectResources] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const data = await ProjectService.fetchProject(id);
        setProjectName(data.name);
        setProjectResources(Array.isArray(data.resources) ? data.resources : []);
      } catch (error) {
        console.error('Error fetching project data:', error);
        setProjectResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  return (
    <Layout title={`Project Details - ${projectName}`}>
      <DashboardHeader projectResources={projectResources} />
      
      {/* Analytics Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PerformanceCard />
        <AvailabilityChart />
        <OccupationChart />
      </div>
      
      {/* Calendar Component */}
      <AttendanceCalendar 
        projectId={id} 
        projectName={projectName}
        projectResources={projectResources}
        setProjectResources={setProjectResources}
      />
    </Layout>
  );
};

export default ProjectDetails;
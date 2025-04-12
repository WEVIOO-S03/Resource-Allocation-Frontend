import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faProjectDiagram, 
  faUsers, 
  faCalendarAlt, 
  faEdit, 
  faEye, 
  faCheckCircle,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { fetchUserProjects } from '../api/userService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchUserProjects();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getProgressColor = (progress) => {
    if (progress >= 66) return 'bg-green-500';
    if (progress >= 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Dashboard" />
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title="Dashboard" />
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="My Projects" />
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">{project.name}</h2>
                    <div className="flex items-center space-x-2">
                      {project.canEdit && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Edit
                        </span>
                      )}
                      {project.canConsult && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          <FontAwesomeIcon icon={faEye} className="mr-1" />
                          View
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {project.code}
                    </span>
                  </div>

                  {project.requiredSkills && project.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">66%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                      <span>15 Tasks</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faComment} className="mr-1" />
                      <span>224 Comments</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
                  >
                    {project.canEdit ? 'Manage Project' : 'View Project'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faProjectDiagram} className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 text-lg">You don't have access to any projects yet.</p>
              <p className="text-gray-400 text-sm mt-2">Contact your administrator for project access.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
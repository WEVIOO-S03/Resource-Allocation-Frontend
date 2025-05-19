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
import Layout from '../components/common/Layout';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await fetchUserProjects();
        console.log('Fetched projects:', data);
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
      <Layout title="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Projects">
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-100 rounded-lg shadow-lg hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-6 flex flex-col ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 truncate" title={project.name}>
                    {project.name}
                  </h2>
                  <div className="flex items-center space-x-2 flex-shrink-0">
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
                  <span className="bg-orange-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    {project.code}
                  </span>
                </div>

                <div className="mb-4 h-12 overflow-hidden">
                  {project.requiredSkills && project.requiredSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full"></div> 
                  )}
                </div>

                <div className="h-20">
                  {project.resources && project.resources.length > 0 ? (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        Resources count: {project.resources.length}
                      </div>
                      <div className="mt-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {project.resources.slice(0, 5).map((resource, index) => (
                            <img
                              key={resource.id || index}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                              src={resource.avatar}
                              alt={resource.fullName || `Team member ${index + 1}`}
                              title={resource.fullName || `Team member ${index + 1}`}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://i.pravatar.cc/150?img=${resource.id || index}`;
                              }}
                            />
                          ))}
                          {project.resources.length > 5 && (
                            <span className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-200 text-xs font-medium text-gray-500">
                              +{project.resources.length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center h-full">
                      <div className="text-sm text-gray-500">No resources found</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">66%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '66%' }}></div>
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

              <div className="px-6 py-3 bg-slate-100 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="w-full bg-slate-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center"
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
    </Layout>
  );
};

export default Dashboard;
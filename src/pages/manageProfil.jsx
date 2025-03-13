import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faEdit,
  faEye,
  faCheck,
  faTimes,
  faSave,
  faUserCog,
  faLock,
  faUnlock
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const ProjectAccessManagement = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('Project Access Rights Management');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [animateRow, setAnimateRow] = useState(null);

  useEffect(() => {
   
    const fetchUser = async (id) => {
      setLoading(true);
      setTimeout(() => {
        setUser({
          id: 1,
          email: 'user@example.com',
          firstName: 'manel',
          lastName: 'askri',
          status: 'APPROVED',
          isActive: true,
          projects: [
            {
              projectId: 1,
              code: 'PROJ-A',
              name: 'Project Alpha',
              canEdit: true,
              canConsult: true,
              description: 'Main marketing campaign project',
              category: 'Marketing'
            },
            {
              projectId: 2,
              code: 'PROJ-B',
              name: 'Project Beta',
              canEdit: false,
              canConsult: true,
              description: 'Customer analytics dashboard',
              category: 'Analytics'
            },
            {
              projectId: 3,
              code: 'PROJ-C',
              name: 'Project Charlie',
              canEdit: false,
              canConsult: false,
              description: 'Internal HR management system',
              category: 'Human Resources'
            }
          ]
        });

        setProjects([
          {
            id: 1,
            code: 'PROJ-A',
            name: 'Project Alpha',
            canEdit: true,
            canConsult: true,
            description: 'Main marketing campaign project',
            category: 'Marketing',
            color: '#4F46E5'
          },
          {
            id: 2,
            code: 'PROJ-B',
            name: 'Project Beta',
            canEdit: false,
            canConsult: true,
            description: 'Customer analytics dashboard',
            category: 'Analytics',
            color: '#7C3AED'
          },
          {
            id: 3,
            code: 'PROJ-C',
            name: 'Project Charlie',
            canEdit: false,
            canConsult: false,
            description: 'Internal HR management system',
            category: 'Human Resources',
            color: '#EC4899'
          },
          {
            id: 4,
            code: 'PROJ-D',
            name: 'Project Delta',
            canEdit: false,
            canConsult: false,
            description: 'Mobile application development',
            category: 'Development',
            color: '#8B5CF6'
          },
          {
            id: 5,
            code: 'PROJ-E',
            name: 'Project Echo',
            canEdit: false,
            canConsult: false,
            description: 'Customer support portal',
            category: 'Support',
            color: '#10B981'
          }
        ]);
        
        setLoading(false);
      }, 800);
    };

    if (userId) {
      fetchUser(userId);
    } else {
      fetchUser(1); 
    }
  }, [userId]);

  const toggleAccess = (projectId, accessType) => {
    setAnimateRow(projectId);
    setTimeout(() => setAnimateRow(null), 500);
    
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        if (accessType === 'edit') {
          return { ...project, canEdit: !project.canEdit };
        } else if (accessType === 'consult') {
          return { ...project, canConsult: !project.canConsult };
        }
      }
      return project;
    }));
  };

  const saveChanges = () => {
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      setSavedSuccess(true);
      
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    }, 1000);
  };

  const filteredProjects = projects.filter(project => {
    // Filter based on search query
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        project.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        project.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter based on active tab
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'edit') return project.canEdit && matchesSearch;
    if (activeTab === 'consult') return project.canConsult && matchesSearch;
    if (activeTab === 'none') return (!project.canEdit && !project.canConsult) && matchesSearch;
    
    return matchesSearch;
  });

  // Get project categories for filter
  const categories = [...new Set(projects.map(project => project.category))];

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header Component */}
        <Header title="Project Access Rights" />

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Input */}
          <div 
            className="bg-white rounded-xl shadow-sm p-6 mb-6 transform transition-all duration-300 hover:shadow-md"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
            }}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                <label className="w-24 font-medium text-gray-700">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-24 font-medium text-gray-700">User:</label>
                <div className="relative flex-1">
                  <select 
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <option value="1">test 1 (user@example.com)</option>
                    <option value="2">user 1 (jane@example.com)</option>
                    <option value="3">user 3 (robert@example.com)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FontAwesomeIcon icon={faUserCog} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Project Access Table */}
          {loading ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Loading user data...</p>
              <div className="w-16 h-1 bg-indigo-500 mx-auto mt-4 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FontAwesomeIcon icon={faLock} className="mr-2 text-indigo-500" />
                    Project Access Rights
                    {savedSuccess && (
                      <span className="ml-4 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full animate-pulse">
                        ✓ Changes saved successfully
                      </span>
                    )}
                  </h2>
                  
                  <button 
                    onClick={saveChanges}
                    className="btn-primary flex items-center text-white rounded-lg px-5 py-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative w-64">
                    <input 
                      type="text" 
                      placeholder="Search projects..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{filteredProjects.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                        activeTab === 'all' 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setActiveTab('edit')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                        activeTab === 'edit' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => setActiveTab('consult')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                        activeTab === 'consult' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FontAwesomeIcon icon={faEye} className="mr-1" />
                      Consult
                    </button>
                    <button 
                      onClick={() => setActiveTab('none')}
                      className={`px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                        activeTab === 'none' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      No Access
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon icon={faEye} className="mr-2 text-green-500" />
                          Consult Access
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center justify-center">
                          <FontAwesomeIcon icon={faEdit} className="mr-2 text-blue-500" />
                          Edit Access
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProjects.map((project, index) => (
                      <tr 
                        key={project.id} 
                        className={`hover:bg-gray-50 transition-all duration-300 ${
                          animateRow === project.id ? 'bg-indigo-50' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: project.color }}
                            >
                              <FontAwesomeIcon icon={faFolder} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{project.name}</div>
                              <div className="text-xs text-gray-500">{project.code}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100">{project.category}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleAccess(project.id, 'consult')}
                              className={`w-16 h-8 rounded-full flex items-center px-1 transition-all duration-300 ${
                                project.canConsult 
                                  ? 'bg-green-500 justify-end' 
                                  : 'bg-gray-300 justify-start'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300"></div>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => toggleAccess(project.id, 'edit')}
                              className={`w-16 h-8 rounded-full flex items-center px-1 transition-all duration-300 ${
                                project.canEdit 
                                  ? 'bg-blue-500 justify-end' 
                                  : 'bg-gray-300 justify-start'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300"></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Empty state */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <FontAwesomeIcon icon={faFolder} className="text-2xl" />
                  </div>
                  <h3 className="mt-4 text-gray-500">No projects found</h3>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
              
              {/* Summary footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                {user && (
                  <div className="flex items-center justify-between">
                    <div>
                      User: <span className="font-medium">{user.firstName} {user.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium">{filteredProjects.filter(p => p.canEdit || p.canConsult).length}</span> projects with access • 
                      <span className="font-medium ml-1">{filteredProjects.filter(p => p.canEdit).length}</span> with edit rights
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectAccessManagement;
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faEdit,
  faEye,
  faSave,
  faUserCog,
  faLock,
  faTags,
} from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchUsers, updateUserRights, fetchProjects, approveUser, getAuthToken  } from '../api/userService';

const ProjectAccessManagement = () => {
  const { id } = useParams(); // Get the ID from URL parameters
  const [user, setUser] = useState(null);
  const [position, setPosition] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [animateRow, setAnimateRow] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log("Fetching user with ID:", id);
            const timestamp = Date.now();
            const userData = await fetchUsers(id, 1, timestamp);
            
            const currentUser = userData.users.find(user => user.id === parseInt(id));

            if (currentUser) {
                console.log("Current user:", currentUser);
                setUser(currentUser);
                
                if (currentUser.position) {
                    setPosition(currentUser.position);
                }
                
                if (currentUser.skills && Array.isArray(currentUser.skills)) {
                    setSkills(currentUser.skills);
                }
            } else {
                console.log("No user found with this ID.");
                setUser(null);
            }

            const projectsData = await fetchProjects(timestamp);
            
            if (currentUser && currentUser.projects) {
            const projectsWithAccess = projectsData.map(project => {
            const userProject = Array.isArray(currentUser.projects) 
            ? currentUser.projects.find(p => p.projectId === project.id)
            : null;
      
      return {
          ...project,
          canConsult: userProject ? userProject.canConsult : false,
          canEdit: userProject ? userProject.canEdit : false
      };
  });

  setProjects(projectsWithAccess);
} else {
  setProjects(projectsData.map(project => ({
      ...project,
      canConsult: false,
      canEdit: false
  })));
}

        } catch (err) {
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    loadUserData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadUserData(); 
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    
    const handleRouteChange = () => {
      if (window.location.pathname.includes(`/users/${id}`)) {
        loadUserData(); 
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [id]);

  const handleAddSkill = () => {
    if (newSkill.trim() !== '' && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };
  
  const saveChanges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!user || !user.id) {
        throw new Error('User data is missing');
      }
      
      let firstUpdateResult = await updateUserRights(user.id, {
        position: position,
        skills: skills
      });
      
      console.log("Updated user basic info:", firstUpdateResult);
      
      const projectsWithAccess = projects.filter(p => p.canConsult || p.canEdit);
      
      console.log(`Updating access for ${projectsWithAccess.length} projects`);
      
      for (const project of projects) {
        try {
          const projectUpdateResult = await updateUserRights(user.id, {
            projectId: project.id,
            canConsult: project.canConsult === true,
            canEdit: project.canEdit === true
          });
          
          console.log(`Updated project ${project.id}:`, projectUpdateResult);
        } catch (projectError) {
          console.error(`Error updating project ${project.id}:`, projectError);
        }
      }
     
      const approveResult = await approveUser(user.id);
      console.log("User approved:", approveResult);
      
      setUser({...user, status: 'APPROVED'});
      setSavedSuccess(true);
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setError(`Failed to save changes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'edit') return project.canEdit && matchesSearch;
    if (activeTab === 'consult') return project.canConsult && matchesSearch;
    if (activeTab === 'none') return (!project.canEdit && !project.canConsult) && matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar Component */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header Component */}
        <Header title="User Access Rights" />

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Info Panel */}
          <div 
            className="bg-white rounded-xl shadow-sm p-6 mb-6 transform transition-all duration-300 hover:shadow-md"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
            }}
          >
            <div className="flex flex-col space-y-4">
              {/* User details row */}
              <div className="flex items-center mb-4">
                <label className="w-24 font-medium text-gray-700">User:</label>
                <div className="relative flex-1">
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-700">
                    {user ? `${user.name} (${user.email})` : 'Loading user...'}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <FontAwesomeIcon icon={faUserCog} className="text-gray-400" />
                  </div>
                </div>
                
                {/* Status badge */}
                <div className="ml-4">
                  <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user?.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {user?.status || 'Unknown'}
                  </span>
                </div>
              </div>
              
              {/* Position input */}
              <div className="flex items-center">
                <label className="w-24 font-medium text-gray-700">Position:</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Enter user position (e.g. Project Manager)"
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
              
              {/* Skills input */}
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <label className="w-24 font-medium text-gray-700">Skills:</label>
                  <div className="flex-1 flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleSkillKeyPress}
                      placeholder="Add skills (e.g. PHP, React, MySQL)"
                      className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="bg-indigo-500 text-white rounded-r-lg px-4 hover:bg-indigo-600 transition-all duration-300"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Skills tags */}
                <div className="ml-24 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center"
                    >
                      <FontAwesomeIcon icon={faTags} className="mr-2 text-xs" />
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-gray-400 text-sm italic">No skills added yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

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
                        ✓ User approved successfully with updated access rights
                      </span>
                    )}
                  </h2>
                  
                  <button 
                    onClick={saveChanges}
                    disabled={loading}
                    className="btn-primary flex items-center text-white rounded-lg px-5 py-2 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ 
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
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
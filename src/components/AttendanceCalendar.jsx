import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';
import ProjectService from '../api/ProjectService';

const AttendanceCalendar = ({ projectId, projectName, projectResources, setProjectResources }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [occupationRecords, setOccupationRecords] = useState({});
  const daysRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);

  useEffect(() => {
    fetchOccupationRecords();
  }, [currentDate, projectId]);

  useEffect(() => {
    if (!isResourceModalOpen) return;
    fetchAvailableResources();
  }, [isResourceModalOpen, projectResources]);
  
  const fetchOccupationRecords = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      const records = await ProjectService.fetchOccupationRecords(startDate, endDate, projectId);
      setOccupationRecords(records);
    } catch (error) {
      console.error('Error fetching occupation records:', error);
      setOccupationRecords({});
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      setLoading(true);
      const resources = await ProjectService.fetchAvailableResources();
      
      const filteredResources = resources.filter(resource => {
        return resource && resource.id && !projectResources.some(pr => pr.id === resource.id);
      });
      
      setAvailableResources(filteredResources);
    } catch (error) {
      console.error('Error fetching available resources:', error);
      setAvailableResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAssignment = async (resourceId) => {
    if (!resourceId) {
      console.error('No resource ID provided');
      return;
    }

    try {
      setLoading(true);
      const updatedProject = await ProjectService.assignResourceToProject(projectId, resourceId);
      setProjectResources(updatedProject.resources || []);
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error('Error assigning resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceRemoval = async (resourceId) => {
    try {
      setLoading(true);
      await ProjectService.removeResourceFromProject(projectId, resourceId);
      setProjectResources(current => current.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Error removing resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (employee, date) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);
    
    const recordKey = `${employee.id}-${format(date, 'yyyy-MM-dd')}`;
    const currentRecord = occupationRecords[recordKey];
    const currentRate = currentRecord ? currentRecord.rate : 0;
    
    const newRate = prompt('Enter occupation rate (0-100):', currentRate);
    if (newRate === null) return;
    
    const rate = parseInt(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Please enter a valid number between 0 and 100');
      return;
    }

    try {
      const updatedRecord = await ProjectService.updateOccupationRate(
        employee.id, 
        projectId, 
        date, 
        rate
      );
      
      setOccupationRecords(prev => ({
        ...prev,
        [recordKey]: {
          rate: updatedRecord.occupationRate,
          updatedAt: updatedRecord.updatedAt,
          updatedBy: updatedRecord.updatedBy
        }
      }));
    } catch (error) {
      console.error('Error updating occupation rate:', error);
      alert('Failed to update occupation rate');
    }
  };

  const getAttendanceStatus = (employeeId, date) => {
    const recordKey = `${employeeId}-${format(date, 'yyyy-MM-dd')}`;
    const record = occupationRecords[recordKey];
    const occupationRate = record ? record.rate : 0;
    
    if (occupationRate >= 80) return 'full';
    if (occupationRate >= 50) return 'moyen';
    return 'low';
  };

  const getOccupationRate = (employeeId, date) => {
    const recordKey = `${employeeId}-${format(date, 'yyyy-MM-dd')}`;
    const record = occupationRecords[recordKey];
    return record ? record.rate : 0;
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const handleColumnClick = (date) => {
    setSelectedColumn(date);
  };

  const isColumnSelected = (date) => {
    return selectedColumn && format(selectedColumn, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  };

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const groupedResources = projectResources.reduce((acc, resource) => {
    const poleName = resource.pole?.name || 'Unassigned';
    if (!acc[poleName]) {
      acc[poleName] = [];
    }
    acc[poleName].push(resource);
    return acc;
  }, {});

  const departments = Object.entries(groupedResources)
    .map(([name, employees]) => ({
      name,
      employees: employees.filter(emp => 
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(dept => dept.employees.length > 0);

  useEffect(() => {
    const daysRow = daysRowRef.current;
    const attendanceRows = attendanceRowsRef.current;

    const handleScroll = (e) => {
      if (e.target === daysRow) {
        attendanceRows.forEach(row => {
          if (row) row.scrollLeft = daysRow.scrollLeft;
        });
      } else {
        const scrollLeft = e.target.scrollLeft;
        daysRow.scrollLeft = scrollLeft;
        attendanceRows.forEach(row => {
          if (row && row !== e.target) row.scrollLeft = scrollLeft;
        });
      }
    };

    daysRow?.addEventListener('scroll', handleScroll);
    attendanceRows.forEach(row => {
      row?.addEventListener('scroll', handleScroll);
    });

    return () => {
      daysRow?.removeEventListener('scroll', handleScroll);
      attendanceRows.forEach(row => {
        row?.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  return (
    <div className="attendance-container rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4">
      <h1 className="text-2xl font-semibold mb-4 text-white">Project Attendance</h1>
      <div className="main-grid bg-white rounded-3xl shadow-sm p-4 text-xs ">
        <div className="calendar-controls">
          <div className="date-range">
            {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
          </div>
          
          <div className="controls-right">
            <button
              onClick={() => setIsResourceModalOpen(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-blue-700 mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Resources
            </button>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search project resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="navigation-container">
              <div className="year-nav">
                <button onClick={handlePrevMonth}>&lt;</button>
                <span>{format(currentDate, 'yyyy')}</span>
                <button onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="month-buttons">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = new Date(currentDate.getFullYear(), i);
                  return (
                    <button
                      key={i}
                      className={`month-btn ${i === currentDate.getMonth() ? 'active' : ''}`}
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), i))}
                    >
                      {format(monthDate, 'MMM')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="days-header">
          <div className="employee-column-header">
            Project Resources ({projectResources.length})
          </div>
          <div className="days-row" ref={daysRowRef}>
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`day-header ${isColumnSelected(day) ? 'selected' : ''} ${isWeekend(day) ? 'week-end' : ''}`}
                onClick={() => handleColumnClick(day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-name">{format(day, 'EEE')}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="departments-container">
          {departments.map((dept, deptIndex) => (
            <div key={deptIndex} className="department-section">
              <div className="department-header">
                {dept.name}
              </div>
              {dept.employees.map((emp, empIndex) => (
                <div key={empIndex} className="employee-attendance-row">
                  <div className="employee-info-cell">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <img src={emp.avatar || `https://i.pravatar.cc/150?img=${emp.id}`} alt={emp.fullName} className="employee-avatar" />
                        <div className="employee-info">
                          <div className="employee-name">{emp.fullName}</div>
                          <div className="employee-title">{emp.position}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResourceRemoval(emp.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove resource"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div 
                    className="attendance-cells bg-white" 
                    ref={el => {
                      if (el) {
                        attendanceRowsRef.current[deptIndex * dept.employees.length + empIndex] = el;
                      }
                    }}
                  >
                    {calendarDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`status-cell status-${getAttendanceStatus(emp.id, day)} ${isToday(day) ? 'today' : ''} ${isColumnSelected(day) ? 'selected' : ''} ${isWeekend(day) ? 'week-end' : ''}`}
                        onClick={() => handleCellClick(emp, day)}
                      >
                        <div className="status-dot" />
                        <div className="occupation-rate">
                          {getOccupationRate(emp.id, day)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {isResourceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Resources to Project</h2>
              <button
                onClick={() => setIsResourceModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {availableResources && availableResources.length > 0 ? (
                  availableResources.map((resource) => (
                    <div 
                      key={`resource-${resource.id}`}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={resource.avatar || `https://i.pravatar.cc/150?img=${resource.id}`}
                          alt={resource.fullName || 'Resource'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{resource.fullName || 'Unnamed Resource'}</div>
                          <div className="text-sm text-gray-500">{resource.position || 'No Position'}</div>
                          <div className="text-xs text-gray-400">
                            {resource.poleName || 'No Department'} • 
                            Availability: {resource.availabilityRate || 0}%
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (resource.id) {
                            handleResourceAssignment(resource.id);
                          } else {
                            console.error('Resource ID is missing');
                          }
                        }}
                        disabled={!resource.id || loading}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add to Project
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No available resources found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
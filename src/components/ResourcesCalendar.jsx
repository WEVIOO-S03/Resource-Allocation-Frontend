import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend } from 'date-fns';
import ResourceService from '../api/resourceService';

const ResourcesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [occupationRecords, setOccupationRecords] = useState({});
  const [projectOccupationRecords, setProjectOccupationRecords] = useState({});
  const daysRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };
  
  useEffect(() => {
    fetchResources();
  }, [currentDate]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);

      const resourcesData = await ResourceService.getAllResources(format(currentDate, 'yyyy-MM-dd'));
      setResources(resourcesData);
      
      const occupationData = await ResourceService.getOccupationRecords(startDate, endDate);
      setOccupationRecords(occupationData);
      
      const projectOccupationData = {};      
      const projectFetches = resourcesData.filter(r => r.projects && r.projects.length > 0)
        .flatMap(resource => {
          return resource.projects.map(async project => {
            try {
              const projectRecords = await ResourceService.getOccupationRecords(
                startDate, 
                endDate, 
                project.id, 
                resource.id
              );
              
              Object.keys(projectRecords).forEach(key => {
                projectOccupationData[key] = projectRecords[key];
              });
            } catch (err) {
              console.error(`Error fetching project ${project.id} data for resource ${resource.id}:`, err);
            }
          });
        });
      
      await Promise.allSettled(projectFetches);
      setProjectOccupationRecords(projectOccupationData);
      
    } catch (error) {
      console.error('Error fetching resources and occupation data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCellClick = (employee, date, projectId = null) => {
    setSelectedEmployee(employee);
    setSelectedDate(date);
    
    let message;
    if (projectId) {
      const project = employee.projects.find(p => p.id === projectId);
      const projectName = project ? project.name : 'Unknown Project';
      const formattedDate = format(date, 'yyyy-MM-dd');
      const recordKey = `${employee.id}-${projectId}-${formattedDate}`;
      const projectRecord = projectOccupationRecords[recordKey];
      const occupationRate = projectRecord ? projectRecord.rate : 0;
      
      message = `Project ${projectName} for ${employee.fullName} on ${formattedDate}: ${occupationRate}%`;
    } else {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const recordKey = `${employee.id}-${formattedDate}`;
      const currentRecord = occupationRecords[recordKey];
      
      const projectSum = calculateTotalProjectOccupation(employee.id, date);
      
      const storedTotal = currentRecord ? currentRecord.rate : 0;
      
      message = `${employee.fullName} occupation on ${formattedDate}: 
        ${storedTotal}% (stored total) / ${projectSum}% (sum of projects)`;
    }
    
    alert(message);
  };

  // NEW FUNCTION: Calculate the sum of all project occupations for an employee on a specific date
  const calculateTotalProjectOccupation = (employeeId, date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let totalOccupation = 0;
    
    // Find the employee to get their projects
    const employee = resources.find(r => r.id === employeeId);
    if (!employee || !employee.projects) {
      return 0;
    }
    
    // Sum up occupation for each project
    employee.projects.forEach(project => {
      const recordKey = `${employeeId}-${project.id}-${formattedDate}`;
      const record = projectOccupationRecords[recordKey];
      if (record) {
        totalOccupation += record.rate;
      }
    });
    
    return totalOccupation;
  };

  const getAttendanceStatus = (employeeId, date, projectId = null) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let occupationRate;
    
    if (projectId) {
      const recordKey = `${employeeId}-${projectId}-${formattedDate}`;
      const record = projectOccupationRecords[recordKey];
      occupationRate = record ? record.rate : 0;
    } else {
      // Get ACTUAL total occupation for display (either from stored total or calculated sum)
      occupationRate = getOccupationRate(employeeId, date);
    }
    
    if (occupationRate >= 80) return 'full';
    if (occupationRate >= 50) return 'moyen';
    return 'low';
  };

  const getOccupationRate = (employeeId, date, projectId = null) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    if (projectId) {
      // Get project-specific occupation rate
      const recordKey = `${employeeId}-${projectId}-${formattedDate}`;
      const record = projectOccupationRecords[recordKey];
      return record ? record.rate : 0;
    } else {
      // THIS IS THE KEY PART THAT NEEDS TO BE FIXED
      
      // Option 1: Use the stored total value from the API
      const recordKey = `${employeeId}-${formattedDate}`;
      const record = occupationRecords[recordKey];
      const storedTotal = record ? record.rate : 0;
      
      // Option 2: Calculate sum of project occupations (more accurate if projects are being managed)
      const calculatedTotal = calculateTotalProjectOccupation(employeeId, date);
      
      // Use either the stored total OR the calculated sum, depending on your business logic
      // For example, take the higher value, or prefer the calculated value if available
      return Math.max(storedTotal, calculatedTotal);
      
      // Alternative approach if i only want to show the sum of projects:
      // return calculatedTotal;
      
      // Or if i only want to show the stored total:
      // return storedTotal;
    }
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

  const groupedResources = resources.reduce((acc, resource) => {
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
  }, [departments, expandedRows]);

  return (
    <div className="attendance-container rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4">
      <h1 className="text-2xl font-semibold mb-4 text-white">Resource Occupation Calendar</h1>
      <div className="main-grid bg-white rounded-3xl shadow-sm p-4">
        <div className="calendar-controls">
          <div className="date-range">
            {format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}
          </div>
          
          <div className="controls-right">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search resources..."
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
            Resources ({resources.length})
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

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="departments-container">
            {departments.map((dept, deptIndex) => (
              <div key={deptIndex} className="department-section">
                <div className="department-header">
                  {dept.name}
                </div>
                {dept.employees.map((emp, empIndex) => (
                  <React.Fragment key={empIndex}>
                    {/* Employee Row */}
                    <div className="employee-attendance-row">
                      <div 
                        className="employee-info-cell cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleRowExpansion(emp.id)}
                      >
                        <div className="flex items-center w-full">
                          <img src={emp.avatar || `https://i.pravatar.cc/150?img=${emp.id}`} alt={emp.fullName} className="employee-avatar" />
                          <div className="employee-info ml-3">
                            <div className="employee-name">{emp.fullName}</div>
                            <div className="employee-title">{emp.position}</div>
                            <div className="text-xs text-gray-500">
                              Projects: {emp.projects?.length || 0} | 
                              Availability: {emp.availability || 0}%
                            </div>
                          </div>
                          <div className="ml-auto text-gray-400">
                            {expandedRows[emp.id] ? '▼' : '▶'}
                          </div>
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

                    {/* Project Rows - Only show when expanded */}
                    {expandedRows[emp.id] && emp.projects && emp.projects.map((project, projectIndex) => (
                      <div key={`${emp.id}-project-${project.id}`} className="employee-attendance-row project-row">
                        <div 
                          className="employee-info-cell project-info-cell bg-emerald-50 border-l-4 border-emerald-500"
                        >
                          <div className="flex items-center w-full pl-8">
                            <div className="project-info">
                              <div className="project-name text-emerald-700 font-medium">{project.name}</div>
                              <div className="text-xs text-gray-500">Project ID: {project.id}</div>
                            </div>
                          </div>
                        </div>
                        <div 
                          className="attendance-cells bg-emerald-50" 
                          ref={el => {
                            if (el) {
                              const rowIndex = deptIndex * dept.employees.length + empIndex + projectIndex + 1;
                              attendanceRowsRef.current[rowIndex] = el;
                            }
                          }}
                        >
                          {calendarDays.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              className={`status-cell status-${getAttendanceStatus(emp.id, day, project.id)} ${isToday(day) ? 'today' : ''} ${isColumnSelected(day) ? 'selected' : ''} ${isWeekend(day) ? 'week-end' : ''}`}
                              onClick={() => handleCellClick(emp, day, project.id)}
                            >
                              <div className="status-dot" />
                              <div className="occupation-rate">
                                {getOccupationRate(emp.id, day, project.id)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .project-row {
          border-top: 1px dashed #e2e8f0;
        }
        
        .project-info-cell {
          padding-left: 1rem;
        }
        
        .project-name {
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default ResourcesCalendar;
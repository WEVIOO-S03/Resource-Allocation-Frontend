import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isSameWeek,
  isToday,
  addDays,
} from 'date-fns';
import ResourceService from '../api/resourceService';

const ResourcesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [occupationRecords, setOccupationRecords] = useState({});
  const [projectOccupationRecords, setProjectOccupationRecords] = useState({});
  const weeksRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [popupInfo, setPopupInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    employee: null,
    week: null,
    projectId: null,
    data: null
  });

  const toggleRowExpansion = (employeeId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupInfo.visible && !event.target.closest('.working-time-popup')) {
        setPopupInfo(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupInfo.visible]);

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

      const occupationData = await ResourceService.getOccupationRecords(
        startDate,
        endDate
      );
      setOccupationRecords(occupationData);

      const projectOccupationData = {};
      const projectFetches = resourcesData
        .filter((r) => r.projects && r.projects.length > 0)
        .flatMap((resource) => {
          return resource.projects.map(async (project) => {
            try {
              const projectRecords = await ResourceService.getOccupationRecords(
                startDate,
                endDate,
                project.id,
                resource.id
              );

              Object.keys(projectRecords).forEach((key) => {
                projectOccupationData[key] = projectRecords[key];
              });
            } catch (err) {
              console.error(
                `Error fetching project ${project.id} data for resource ${resource.id}:`,
                err
              );
            }
          });
        });

      await Promise.allSettled(projectFetches);
      setProjectOccupationRecords(projectOccupationData);
    } catch (error) {
      console.error("Error fetching resources and occupation data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (employee, week, projectId = null, event) => {
    const x = event.clientX;
    const y = event.clientY;
    
    setSelectedEmployee(employee);
    setSelectedWeek(week);

    let popupData = {};
    if (projectId) {
      const project = employee.projects.find((p) => p.id === projectId);
      const projectName = project ? project.name : "Unknown Project";
      const weekStartFormatted = format(week, "yyyy-MM-dd");
      const weekEndFormatted = format(addDays(week, 6), "yyyy-MM-dd");
      const recordKey = `${employee.id}-${projectId}-${weekStartFormatted}`;
      const projectRecord = projectOccupationRecords[recordKey];
      const occupationRate = projectRecord ? projectRecord.rate : 0;

      popupData = {
        type: 'project',
        projectName,
        weekStart: weekStartFormatted,
        weekEnd: weekEndFormatted,
        occupationRate
      };
    } else {
      const weekStartFormatted = format(week, "yyyy-MM-dd");
      const weekEndFormatted = format(addDays(week, 6), "yyyy-MM-dd");
      const recordKey = `${employee.id}-${weekStartFormatted}`;
      const currentRecord = occupationRecords[recordKey];
      const projectSum = calculateTotalProjectOccupation(employee.id, week);
      const storedTotal = currentRecord ? currentRecord.rate : 0;

      popupData = {
        type: 'employee',
        weekStart: weekStartFormatted,
        weekEnd: weekEndFormatted,
        storedTotal,
        projectSum
      };
    }

    setPopupInfo({
      visible: true,
      x,
      y,
      employee,
      week,
      projectId,
      data: popupData
    });
  };

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, visible: false }));
  };

  const calculateTotalProjectOccupation = (employeeId, weekStart) => {
    const formattedWeekStart = format(weekStart, "yyyy-MM-dd");
    let totalOccupation = 0;

    const employee = resources.find((r) => r.id === employeeId);
    if (!employee || !employee.projects) {
      return 0;
    }

    employee.projects.forEach((project) => {
      const recordKey = `${employeeId}-${project.id}-${formattedWeekStart}`;
      const record = projectOccupationRecords[recordKey];
      if (record) {
        totalOccupation += record.rate;
      }
    });

    return totalOccupation;
  };

  const getAttendanceStatus = (employeeId, weekStart, projectId = null) => {
    const occupationRate = getOccupationRate(employeeId, weekStart, projectId);

    if (occupationRate >= 80) return "full";
    if (occupationRate >= 50) return "moyen";
    return "low";
  };

  const getOccupationRate = (employeeId, weekStart, projectId = null) => {
    const formattedWeekStart = format(weekStart, "yyyy-MM-dd");

    if (projectId) {
      const recordKey = `${employeeId}-${projectId}-${formattedWeekStart}`;
      const record = projectOccupationRecords[recordKey];
      return record ? record.rate : 0;
    } else {
      const recordKey = `${employeeId}-${formattedWeekStart}`;
      const record = occupationRecords[recordKey];
      const storedTotal = record ? record.rate : 0;

      const calculatedTotal = calculateTotalProjectOccupation(
        employeeId,
        weekStart
      );

      return Math.max(storedTotal, calculatedTotal);
    }
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleColumnClick = (week) => {
    setSelectedColumn(week);
  };

  const isColumnSelected = (week) => {
    return (
      selectedColumn && isSameWeek(selectedColumn, week, { weekStartsOn: 1 })
    );
  };

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const calendarWeeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 }
  );

  const groupedResources = resources.reduce((acc, resource) => {
    const poleName = resource.pole?.name || "Unassigned";
    if (!acc[poleName]) {
      acc[poleName] = [];
    }
    acc[poleName].push(resource);
    return acc;
  }, {});

  const departments = Object.entries(groupedResources)
    .map(([name, employees]) => ({
      name,
      employees: employees.filter((emp) =>
        emp.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((dept) => dept.employees.length > 0);

  useEffect(() => {
    const weeksRow = weeksRowRef.current;
    const attendanceRows = attendanceRowsRef.current;

    const handleScroll = (e) => {
      if (e.target === weeksRow) {
        attendanceRows.forEach((row) => {
          if (row) row.scrollLeft = weeksRow.scrollLeft;
        });
      } else {
        const scrollLeft = e.target.scrollLeft;
        weeksRow.scrollLeft = scrollLeft;
        attendanceRows.forEach((row) => {
          if (row && row !== e.target) row.scrollLeft = scrollLeft;
        });
      }
    };

    weeksRow?.addEventListener("scroll", handleScroll);
    attendanceRows.forEach((row) => {
      row?.addEventListener("scroll", handleScroll);
    });

    return () => {
      weeksRow?.removeEventListener("scroll", handleScroll);
      attendanceRows.forEach((row) => {
        row?.removeEventListener("scroll", handleScroll);
      });
    };
  }, [departments, expandedRows]);

  const isCurrentWeek = (weekStart) => {
    const today = new Date();
    const weekEnd = addDays(weekStart, 6);
    return today >= weekStart && today <= weekEnd;
  };

  return (
    <div className="attendance-container rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        Resource Occupation Calendar (Weekly)
      </h1>
      <div className="main-grid bg-white rounded-3xl shadow-sm p-4">
        <div className="calendar-controls text-xs">
          <div className="controls-right-resources">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div className="navigation-container text-xs">
              <div className="year-nav">
                <button onClick={handlePrevMonth}>&lt;</button>
                <span>{format(currentDate, "yyyy")}</span>
                <button onClick={handleNextMonth}>&gt;</button>
              </div>
              <div className="month-buttons">
                {Array.from({ length: 12 }, (_, i) => {
                  const monthDate = new Date(currentDate.getFullYear(), i);
                  return (
                    <button
                      key={i}
                      className={`month-btn  ${
                        i === currentDate.getMonth() ? "active" : ""
                      }`}
                      onClick={() =>
                        setCurrentDate(new Date(currentDate.getFullYear(), i))
                      }
                    >
                      {format(monthDate, "MMM")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="date-range text-xs">
            {format(startDate, "dd MMM yyyy")} -{" "}
            {format(endDate, "dd MMM yyyy")}
          </div>
        </div>

        <div className="days-header">
          <div className="employee-column-header">
            Resources ({resources.length})
          </div>
          <div className="days-row" ref={weeksRowRef}>
            {calendarWeeks.map((weekStart, index) => {
              const weekEnd = addDays(weekStart, 6);
              return (
                <div
                  key={index}
                  className={`week-header ${
                    isColumnSelected(weekStart) ? "selected" : ""
                  } ${isCurrentWeek(weekStart) ? "current-week" : ""}`}
                  onClick={() => handleColumnClick(weekStart)}
                >
                  <div className="week-number">
                    Week {format(weekStart, "w")}
                  </div>
                  <div className="week-dates">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
                  </div>
                </div>
              );
            })}
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
                <div className="department-header">{dept.name}</div>
                {dept.employees.map((emp, empIndex) => (
                  <React.Fragment key={empIndex}>
                    {/* Employee Row */}
                    <div className="employee-attendance-row">
                      <div
                        className="employee-info-cell cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleRowExpansion(emp.id)}
                      >
                        <div className="flex items-center">
                          <img
                            src={
                              emp.avatar ||
                              `https://i.pravatar.cc/150?img=${emp.id}`
                            }
                            alt={emp.fullName}
                            className="employee-avatar"
                          />
                          <div className="employee-info ml-3">
                            <div className="employee-name">{emp.fullName}</div>
                            <div className="employee-title">{emp.position}</div>
                            <div className="text-xs text-gray-500">
                              Projects: {emp.projects?.length || 0} |
                              Availability: {emp.availability || 0}%
                            </div>
                          </div>
                          <div className="ml-auto text-gray-400">
                            {expandedRows[emp.id] ? "▼" : "▶"}
                          </div>
                        </div>
                      </div>
                      <div
                        className="attendance-cells bg-white"
                        ref={(el) => {
                          if (el) {
                            attendanceRowsRef.current[
                              deptIndex * dept.employees.length + empIndex
                            ] = el;
                          }
                        }}
                      >
                        {calendarWeeks.map((weekStart, weekIndex) => (
                          <div
                            key={weekIndex}
                            className={`status-cell h-auto status-${getAttendanceStatus(
                              emp.id,
                              weekStart
                            )} ${
                              isCurrentWeek(weekStart) ? "current-week" : ""
                            } ${isColumnSelected(weekStart) ? "selected" : ""}`}
                            onClick={(e) => handleCellClick(emp, weekStart, null, e)}
                          >
                            <div className="status-dot">
                              {getOccupationRate(emp.id, weekStart)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Project Rows - Only show when expanded */}
                    {expandedRows[emp.id] &&
                      emp.projects &&
                      emp.projects.map((project, projectIndex) => (
                        <div
                          key={`${emp.id}-project-${project.id}`}
                          className="employee-attendance-row project-row"
                        >
                          <div className="employee-info-cell project-info-cell bg-emerald-50 border-l-4 border-emerald-500">
                            <div className="flex items-center w-full pl-8">
                              <div className="project-info">
                                <div className="project-name text-emerald-700 font-medium">
                                  {project.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Project ID: {project.id}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="attendance-cells bg-emerald-50"
                            ref={(el) => {
                              if (el) {
                                const rowIndex =
                                  deptIndex * dept.employees.length +
                                  empIndex +
                                  projectIndex +
                                  1;
                                attendanceRowsRef.current[rowIndex] = el;
                              }
                            }}
                          >
                            {calendarWeeks.map((weekStart, weekIndex) => (
                              <div
                                key={weekIndex}
                                className={`status-cell status-${getAttendanceStatus(
                                  emp.id,
                                  weekStart,
                                  project.id
                                )} ${
                                  isCurrentWeek(weekStart) ? "current-week" : ""
                                } ${
                                  isColumnSelected(weekStart) ? "selected" : ""
                                }`}
                                onClick={(e) =>
                                  handleCellClick(emp, weekStart, project.id, e)
                                }
                              >
                                <div className="status-dot">
                                  {getOccupationRate(
                                    emp.id,
                                    weekStart,
                                    project.id
                                  )}
                                  %
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

        {popupInfo.visible && popupInfo.employee && popupInfo.week && (
          <div 
            className="working-time-popup bg-white rounded-lg shadow-lg p-4 absolute z-20 border border-gray-200"
            style={{ 
              top: `${popupInfo.y}px`, 
              left: `${popupInfo.x}px`, 
              transform: 'translate(-50%, -100%)',
              minWidth: '280px'
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800">
                {popupInfo.employee.fullName} - {format(popupInfo.week, 'MMM d, yyyy')}
              </h4>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={closePopup}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="border-t border-gray-200 pt-2">
              {popupInfo.data.type === 'project' ? (
                <>
                  <div className="working-time-entry flex justify-between py-1">
                    <span className="working-time-label text-gray-600">Project:</span>
                    <span className="working-time-value font-medium">{popupInfo.data.projectName}</span>
                  </div>
                  <div className="working-time-entry flex justify-between py-1">
                    <span className="working-time-label text-gray-600">Week:</span>
                    <span className="working-time-value">
                      {popupInfo.data.weekStart} to {popupInfo.data.weekEnd}
                    </span>
                  </div>
                  <div className="working-time-entry flex justify-between py-1">
                    <span className="working-time-label text-gray-600">Occupation:</span>
                    <span className="working-time-value font-medium">
                      {popupInfo.data.occupationRate}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="working-time-entry flex justify-between py-1">
                    <span className="working-time-label text-gray-600">Week:</span>
                    <span className="working-time-value">
                      {popupInfo.data.weekStart} to {popupInfo.data.weekEnd}
                    </span>
                  </div>
                  
                  <div className="working-time-entry flex justify-between py-1">
                    <span className="working-time-label text-gray-600">Projects Sum:</span>
                    <span className="working-time-value font-medium">
                      {popupInfo.data.projectSum}%
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-3 flex justify-end space-x-2">
              <button 
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={closePopup}
              >
                Close
              </button>
             
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesCalendar;
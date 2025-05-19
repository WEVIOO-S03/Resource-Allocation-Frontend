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
import MonthNavigator from './calendar/MonthNavigator';
import SearchInput from './calendar/SearchInput';

const ResourcesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [occupationRecords, setOccupationRecords] = useState({});
  const [projectOccupationRecords, setProjectOccupationRecords] = useState({});
  const weeksRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (employeeId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
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
    <div className="rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4 h-full flex flex-col overflow-hidden">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        Resource Occupation Calendar (Weekly)
      </h1>
      <div className="bg-white rounded-3xl shadow-sm p-4 flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-4">
            <SearchInput 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              placeholder="Search resources..."
              withIcon={true}
            />
            <MonthNavigator 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate} 
            />
          </div>
          
        </div>

        <div className="flex bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="w-[300px] flex-shrink-0 px-4 py-3 font-medium text-gray-700 bg-white border-r border-gray-200">
            Resources ({resources.length})
          </div>
          <div className="flex flex-1 overflow-x-auto scrollbar-none" ref={weeksRowRef}>
            {calendarWeeks.map((weekStart, index) => {
              const weekEnd = addDays(weekStart, 6);
              return (
                <div
                  key={index}
                  className={`min-w-[140px] flex flex-col items-center justify-center p-2 border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                    isColumnSelected(weekStart) ? "bg-gray-200" : ""
                  } ${isCurrentWeek(weekStart) ? "bg-blue-50 border-l-2 border-r-2 border-blue-500" : ""}`}
                  onClick={() => handleColumnClick(weekStart)}
                >
                  <div className="font-semibold text-sm">
                    Week {format(weekStart, "w")}
                  </div>
                  <div className="text-xs text-gray-500">
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
          <div className="flex-1 overflow-auto">
            {departments.map((dept, deptIndex) => (
              <div key={deptIndex} className="flex flex-col">
                <div className="py-2 px-4 bg-white font-medium text-emerald-500 text-sm border-b border-gray-200">
                  {dept.name}
                </div>
                {dept.employees.map((emp, empIndex) => (
                  <React.Fragment key={empIndex}>
                    {/* Employee Row */}
                    <div className="flex min-h-14 border-b border-gray-200">
                      <div
                        className="w-[300px] flex-shrink-0 px-4 py-3 flex items-center bg-white border-r border-gray-200 sticky left-0 z-10 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleRowExpansion(emp.id)}
                      >
                        <div className="flex items-center w-full">
                          <img
                            src={
                              emp.avatar ||
                              `https://i.pravatar.cc/150?img=${emp.id}`
                            }
                            alt={emp.fullName}
                            className="w-8 h-8 rounded-full mr-1.5"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 text-sm">{emp.fullName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{emp.position}</div>
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
                        className="flex flex-1 overflow-x-auto scrollbar-none bg-white"
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
                            className={`min-w-[140px] h-auto flex flex-col items-center justify-center border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                              isCurrentWeek(weekStart) ? "bg-blue-50 border-l-2 border-r-2 border-blue-500" : ""
                            } ${isColumnSelected(weekStart) ? "bg-gray-200" : ""}`}
                            
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                              getAttendanceStatus(emp.id, weekStart) === "full" ? "bg-green-500" :
                              getAttendanceStatus(emp.id, weekStart) === "moyen" ? "bg-yellow-500" : "bg-red-500"
                            }`}>
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
                          className="flex min-h-14 border-b border-gray-200"
                        >
                          <div className="w-[300px] flex-shrink-0 px-4 py-3 flex items-center bg-emerald-50 border-l-4 border-emerald-500 border-r border-gray-200 sticky left-0 z-10">
                            <div className="flex items-center w-full pl-8">
                              <div>
                                <div className="text-emerald-700 font-medium text-[0.95rem]">
                                  {project.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Project ID: {project.id}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            className="flex flex-1 overflow-x-auto scrollbar-none bg-emerald-50"
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
                                className={`min-w-[140px] flex flex-col items-center justify-center border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                                  isCurrentWeek(weekStart) ? "bg-blue-50 border-l-2 border-r-2 border-blue-500" : ""
                                } ${isColumnSelected(weekStart) ? "bg-gray-200" : ""}`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                                  getAttendanceStatus(emp.id, weekStart, project.id) === "full" ? "bg-green-500" :
                                  getAttendanceStatus(emp.id, weekStart, project.id) === "moyen" ? "bg-yellow-500" : "bg-red-500"
                                }`}>
                                  {getOccupationRate(
                                    emp.id,
                                    weekStart,
                                    project.id
                                  )}%
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
    </div>
  );
};

export default ResourcesCalendar;

import React, { useState, useRef, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isToday,
  isWeekend,
  addDays,
  isSameWeek,
} from "date-fns";
import ProjectService from "../api/ProjectService";
import MonthNavigator from "../components/calendar/MonthNavigator";
import SearchInput from "../components/calendar/SearchInput";
import CalendarHeader from "./calendar/CalendarHeader";

const AttendanceCalendar = ({
  projectId,
  projectName,
  projectResources,
  setProjectResources,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [occupationRecords, setOccupationRecords] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const weeksRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchOccupationRecords();
  }, [currentDate, projectId]);

  useEffect(() => {
    if (!isResourceModalOpen) return;
    fetchAvailableResources();
  }, [isResourceModalOpen, projectResources]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        editingCell &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        handleSaveRate();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  const fetchOccupationRecords = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      const records = await ProjectService.fetchOccupationRecords(
        startDate,
        endDate,
        projectId
      );
      setOccupationRecords(records);
    } catch (error) {
      console.error("Error fetching occupation records:", error);
      setOccupationRecords({});
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableResources = async () => {
    try {
      setLoading(true);
      const resources = await ProjectService.fetchAvailableResources();

      const filteredResources = resources.filter((resource) => {
        return (
          resource &&
          resource.id &&
          !projectResources.some((pr) => pr.id === resource.id)
        );
      });

      setAvailableResources(filteredResources);
    } catch (error) {
      console.error("Error fetching available resources:", error);
      setAvailableResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAssignment = async (resourceId) => {
    if (!resourceId) {
      console.error("No resource ID provided");
      return;
    }

    try {
      setLoading(true);
      const updatedProject = await ProjectService.assignResourceToProject(
        projectId,
        resourceId
      );
      setProjectResources(updatedProject.resources || []);   
      await fetchOccupationRecords();
      
      setIsResourceModalOpen(false);
    } catch (error) {
      console.error("Error assigning resource:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceRemoval = async (resourceId) => {
    try {
      setLoading(true);
      await ProjectService.removeResourceFromProject(projectId, resourceId);
      setProjectResources((current) =>
        current.filter((r) => r.id !== resourceId)
      );
      
      await fetchOccupationRecords();
    } catch (error) {
      console.error("Error removing resource:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (employee, weekStartDate) => {
    const cellId = `${employee.id}-${format(weekStartDate, "yyyy-MM-dd")}`;
    const occupationRate = getOccupationRate(employee.id, weekStartDate);

    setEditingCell(cellId);
    setEditValue(occupationRate.toString());
    setSelectedEmployee(employee);
    setSelectedWeekStart(weekStartDate);
  };

  const handleSaveRate = async () => {
    if (!editingCell || !selectedEmployee || !selectedWeekStart) {
      setEditingCell(null);
      return;
    }

    const rate = parseInt(editValue);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert("Please enter a valid number between 0 and 100");
      setEditingCell(null);
      return;
    }

    try {
      const updatedRecord = await ProjectService.updateOccupationRate(
        selectedEmployee.id,
        projectId,
        selectedWeekStart,
        rate
      );

      const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
      let currentDay = new Date(selectedWeekStart);

      while (currentDay <= weekEnd) {
        const recordKey = `${selectedEmployee.id}-${format(
          currentDay,
          "yyyy-MM-dd"
        )}`;
        setOccupationRecords((prev) => ({
          ...prev,
          [recordKey]: {
            rate: updatedRecord.occupationRate,
            updatedAt: updatedRecord.updatedAt,
            updatedBy: updatedRecord.updatedBy,
            weekStart: format(selectedWeekStart, "yyyy-MM-dd"),
            weekEnd: format(weekEnd, "yyyy-MM-dd"),
          },
        }));
        currentDay = addDays(currentDay, 1);
      }
      setEditingCell(null);
      setEditValue("");
      setSelectedEmployee(null);
      setSelectedWeekStart(null);
    } catch (error) {
      console.error("Error updating occupation rate:", error);
      alert("Failed to update occupation rate");
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveRate();
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const getAttendanceStatus = (employeeId, weekStartDate) => {
    const midWeekDay = addDays(weekStartDate, 2);
    const recordKey = `${employeeId}-${format(midWeekDay, "yyyy-MM-dd")}`;
    const record = occupationRecords[recordKey];
    const occupationRate = record ? record.rate : 0;

    if (occupationRate >= 80) return 'full';
    if (occupationRate >= 50) return 'moyen';
    return 'low';
  };

  const getOccupationRate = (employeeId, weekStartDate) => {
    const midWeekDay = addDays(weekStartDate, 2);
    const recordKey = `${employeeId}-${format(midWeekDay, "yyyy-MM-dd")}`;
    const record = occupationRecords[recordKey];
    return record ? record.rate : 0;
  };

  const getAvailabilityBackgroundColor = (availability) => {
    const availabilityValue = availability || 0;
    
    if (availabilityValue >= 70) {
      return "bg-green-200 border-green-200 hover:bg-green-100";
    } else if (availabilityValue >= 40) {
      return "bg-yellow-200 border-yellow-200 hover:bg-yellow-100";
    } else {
      return "bg-red-200 border-red-200 hover:bg-red-100";
    }
  };

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

  const groupedResources = projectResources.reduce((acc, resource) => {
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

    weeksRow?.addEventListener('scroll', handleScroll);
    attendanceRows.forEach((row) => {
      row?.addEventListener('scroll', handleScroll);
    });

    return () => {
      weeksRow?.removeEventListener('scroll', handleScroll);
      attendanceRows.forEach((row) => {
        row?.removeEventListener('scroll', handleScroll);
      });
    };
  }, []);

  const isCurrentWeek = (weekStart) => {
    const today = new Date();
    const weekEnd = addDays(weekStart, 6);
    return today >= weekStart && today <= weekEnd;
  };

  return (
    <div className="rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4 h-full flex flex-col overflow-hidden">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        Project Weekly Attendance
      </h1>
      <div className="bg-white rounded-3xl shadow-sm p-4 text-xs flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 pb-4 mb-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsResourceModalOpen(true)}
                className="flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Resources
              </button>

              <SearchInput
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                placeholder="Search project resources..." 
              />
            </div>

            <MonthNavigator 
              currentDate={currentDate} 
              setCurrentDate={setCurrentDate} 
            />
          </div>
        </div>

        <CalendarHeader
          title="Resources"
          count={projectResources.length}  
          calendarWeeks={calendarWeeks}
          weeksRowRef={weeksRowRef}
          handleColumnClick={handleColumnClick}
          isColumnSelected={isColumnSelected}
          isCurrentWeek={isCurrentWeek}
          minWeekWidth="140px"
          weekHeaderFormat="detailed"
        />

        <div className="flex-1 overflow-auto">
          {departments.map((dept, deptIndex) => (
            <div key={deptIndex} className="flex flex-col">
              <div className="py-2 px-4 bg-white font-medium text-emerald-500 text-sm border-b border-gray-200">
                {dept.name}
              </div>
              {dept.employees.map((emp, empIndex) => (
                <div key={empIndex} className="flex min-h-14 border-b border-gray-200">
                  <div className="w-[300px] flex-shrink-0 px-4 py-3 flex items-center bg-white border-r border-gray-200 sticky left-0 z-10">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <img
                          src={
                            emp.avatar ||
                            `https://i.pravatar.cc/150?img=${emp.id}`
                          }
                          alt={emp.fullName}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {emp.fullName}
                          </div>
                          <div className="text-gray-500 text-xs mt-0.5">
                            {emp.position}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleResourceRemoval(emp.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove resource"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex overflow-x-auto scrollbar-thin bg-white"
                    ref={(el) => {
                      if (el) {
                        attendanceRowsRef.current[
                          deptIndex * dept.employees.length + empIndex
                        ] = el;
                      }
                    }}
                  >
                    {calendarWeeks.map((weekStart, weekIndex) => {
                      const cellId = `${emp.id}-${format(
                        weekStart,
                        "yyyy-MM-dd"
                      )}`;
                      const isEditing = editingCell === cellId;
                      const attendanceStatus = getAttendanceStatus(emp.id, weekStart);
                      
                      return (
                        <div
                          key={weekIndex}
                          className={`min-w-[140px] h-auto flex flex-col items-center justify-center border-r border-gray-200 cursor-pointer hover:bg-gray-100 
                            ${isCurrentWeek(weekStart) ? "bg-blue-50 border-l-2 border-r-2 border-blue-500" : ""}
                            ${isColumnSelected(weekStart) ? "bg-gray-200" : ""}`}
                          onClick={() => handleCellClick(emp, weekStart)}
                        >
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              type="number"
                              min="0"
                              max="100"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveRate}
                              className="w-16 text-center border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                              attendanceStatus === "full" ? "bg-green-500" :
                              attendanceStatus === "moyen" ? "bg-yellow-500" : "bg-red-500"
                            }`}>
                              {getOccupationRate(emp.id, weekStart)}%
                            </div>
                          )}
                        </div>
                      );
                    })}
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
              <h2 className="text-xl font-semibold">
                Add Resources to Project
              </h2>
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
                      className={`flex items-center justify-between p-4 border rounded-lg ${getAvailabilityBackgroundColor(resource.availability)}`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            resource.avatar ||
                            `https://i.pravatar.cc/150?img=${resource.id}`
                          }
                          alt={resource.fullName || "Resource"}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">
                            {resource.fullName || "Unnamed Resource"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {resource.position || "No Position"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {resource.poleName || "No Department"} •
                            Availability: {resource.availability || 0}%
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (resource.id) {
                            handleResourceAssignment(resource.id);
                          } else {
                            console.error("Resource ID is missing");
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
        
      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default AttendanceCalendar;
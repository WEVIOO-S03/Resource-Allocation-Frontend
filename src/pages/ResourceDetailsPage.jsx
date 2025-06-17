import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachWeekOfInterval, startOfDay } from 'date-fns';
import ResourceService from '../api/resourceService';
import ResourceCalendarRow from '../components/calendar/ResourceCalendarRow';
import CalendarHeader from '../components/calendar/CalendarHeader';
import MonthNavigator from '../components/calendar/MonthNavigator';
import Layout from '../components/common/Layout';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [occupationRecords, setOccupationRecords] = useState({});
  const [projectOccupationRecords, setProjectOccupationRecords] = useState({});
  const [expandedRows, setExpandedRows] = useState({ [id]: true });
  const [selectedColumn, setSelectedColumn] = useState(null);
  const weeksRowRef = useRef(null);
  const attendanceRowsRef = useRef([]);

  useEffect(() => {
    fetchResourceDetails();
  }, [id, currentDate]);

  const fetchResourceDetails = async () => {
    try {
      setLoading(true);
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      const startDate = subWeeks(weekStart, 4);
      const endDate = addWeeks(weekEnd, 3);
      
      const resourceData = await ResourceService.getResourceDetails(id);
      setResource(resourceData);

      const occupationData = await ResourceService.getOccupationRecords(
        startDate,
        endDate,
        null,
        id
      );
      setOccupationRecords(occupationData);

      const projectOccupationData = {};
      if (resourceData.projects && resourceData.projects.length > 0) {
        const projectFetches = resourceData.projects.map(async (project) => {
          try {
            const projectRecords = await ResourceService.getOccupationRecords(
              startDate,
              endDate,
              project.id,
              id
            );

            Object.keys(projectRecords).forEach((key) => {
              projectOccupationData[key] = projectRecords[key];
            });
          } catch (err) {
            console.error(
              `Error fetching project ${project.id} data for resource ${id}:`,
              err
            );
          }
        });

        await Promise.allSettled(projectFetches);
      }
      setProjectOccupationRecords(projectOccupationData);

    } catch (error) {
      console.error("Error fetching resource details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  const handleColumnClick = (week) => {
    setSelectedColumn(week);
  };

  const isColumnSelected = (week) => {
    return selectedColumn && 
      startOfDay(week).getTime() === startOfDay(selectedColumn).getTime();
  };

  const toggleRowExpansion = (resourceId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [resourceId]: !prev[resourceId],
    }));
  };

  const calculateTotalProjectOccupation = (employeeId, weekStart) => {
    const formattedWeekStart = format(weekStart, "yyyy-MM-dd");
    let totalOccupation = 0;

    if (!resource || !resource.projects) {
      return 0;
    }

    resource.projects.forEach((project) => {
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

  const isCurrentWeek = (weekStart) => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    return startOfDay(weekStart).getTime() === startOfDay(currentWeekStart).getTime();
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const displayStartDate = subWeeks(weekStart, 4);
  const displayEndDate = addWeeks(weekStart, 3);
  
  const calendarWeeks = eachWeekOfInterval(
    { start: displayStartDate, end: displayEndDate },
    { weekStartsOn: 1 }
  );

  return (
        <Layout >
    
      <div className="rounded-3xl shadow-lg bg-emerald-600 p-6 mt-4 h-full flex flex-col overflow-hidden">
      <h1 className="text-2xl font-semibold mb-4 text-white">
        Resource Details
      </h1>
      <div className="bg-white rounded-3xl shadow-sm p-4 flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !resource ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Resource not found</p>
          </div>
        ) : (
          <>
          
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center">
                <img
                  src={resource.avatar || `https://i.pravatar.cc/150?img=${resource.id}`}
                  alt={resource.fullName}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{resource.fullName}</h2>
                  <p className="text-gray-600">{resource.position}</p>
                  {resource.pole && (
                    <p className="text-sm text-emerald-600">Department: {resource.pole.name}</p>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-bold text-emerald-600">
                    {resource.occupation?.total || 0}% Occupied
                  </div>
                  <div className="text-gray-600">
                    {resource.availability || 0}% Available
                  </div>
                  {resource.warning && (
                    <div className="text-sm text-orange-500 mt-1">
                      {resource.warning}
                    </div>
                  )}
                </div>
              </div>
            </div>

            
            <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center">
                <MonthNavigator
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  showWeekNavigator={true}
                  handlePrevWeek={handlePrevWeek}
                  handleNextWeek={handleNextWeek}
                />
              </div>
            </div>

            
            <CalendarHeader
          title="Weekly Occupation"
          count={resource.projects?.length || 0}
          calendarWeeks={calendarWeeks}
          weeksRowRef={weeksRowRef}
          handleColumnClick={handleColumnClick}
          isColumnSelected={isColumnSelected}
          isCurrentWeek={isCurrentWeek}
          minWeekWidth="140px"
          weekHeaderFormat="detailed"
          scrollRef={attendanceRowsRef} 
        />

           
            <div className="flex-1">
          <ResourceCalendarRow
            employee={resource}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
            calendarWeeks={calendarWeeks}
            getAttendanceStatus={getAttendanceStatus}
            getOccupationRate={getOccupationRate}
            isCurrentWeek={isCurrentWeek}
            isColumnSelected={isColumnSelected}
            deptIndex={0}
            empIndex={0}
            attendanceRowsRef={attendanceRowsRef}
            weeksRowRef={weeksRowRef}
          />
        </div>
           
            <div className="px-6 py-5 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {resource.skills && resource.skills.length > 0 ? (
                  resource.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No skills listed</span>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-4">Current Week Occupation</h3>
              {resource.occupation?.byProject && resource.occupation.byProject.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resource.occupation.byProject.map((project, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                      <div className="font-medium text-gray-900">{project.projectName}</div>
                      <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-emerald-600 h-2.5 rounded-full"
                            style={{ width: `${project.rate}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-700 ml-2">{project.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No project allocation for the current week</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </Layout>
  );
};

export default ResourceDetailsPage;
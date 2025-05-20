import React from 'react';
import { Link } from "react-router-dom";
import { format } from 'date-fns';

const ResourceCalendarRow = ({
  employee,
  expandedRows,
  toggleRowExpansion,
  calendarWeeks,
  getAttendanceStatus,
  getOccupationRate,
  isCurrentWeek,
  isColumnSelected,
  deptIndex,
  empIndex,
  attendanceRowsRef
}) => {
  return (
    <React.Fragment>
      {/* Employee Row */}
      <div className="flex flex-col min-h-14 border-b border-gray-200">
        <div className="flex flex-row">
          <div
            className="w-[300px] flex-shrink-0 px-4 py-3 flex items-center bg-white border-r border-gray-200 sticky left-0 z-10 cursor-pointer hover:bg-gray-100"
            onClick={() => toggleRowExpansion(employee.id)} 
          >
            <div className="flex items-center w-full">
              <Link to={`/`}>
                <img
                  src={
                    employee.avatar ||
                    `https://i.pravatar.cc/150?img=${employee.id}`
                  }
                  alt={employee.fullName}
                  className="w-8 h-8 rounded-full mr-1.5"
                />
              </Link>
              <div className="ml-3">
                <div className="font-medium text-gray-900 text-sm">{employee.fullName}</div>
                <div className="text-xs text-gray-500 mt-0.5">{employee.position}</div>
                <div className="text-xs text-gray-500">
                  Projects: {employee.projects?.length || 0} |
                  Availability: {employee.availability || 0}%
                </div>
              </div>
              
              <div className="ml-auto text-gray-400">
                {expandedRows[employee.id] ? "▼" : "▶"}
              </div>
            </div>
          </div>
          <div
            className="flex flex-1 overflow-x-auto scrollbar-none bg-white"
            ref={(el) => {
              if (el) {
                attendanceRowsRef.current[
                  deptIndex * employee.projects?.length + empIndex
                ] = el;
              }
            }}
          >
            {calendarWeeks.map((weekStart, weekIndex) => (
              <div
                key={weekIndex}
                className={`min-w-[140px] h-auto flex flex-col items-center justify-center border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                  isCurrentWeek(weekStart) ? "bg-blue-50 border-l-2 border-r-2 border-blue-500" : ""
                } ${isColumnSelected(weekStart) ? "bg-blue-50" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                  getAttendanceStatus(employee.id, weekStart) === "full" ? "bg-green-500" :
                  getAttendanceStatus(employee.id, weekStart) === "moyen" ? "bg-yellow-500" : "bg-red-500"
                }`}>
                  {getOccupationRate(employee.id, weekStart)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Rows - Only show when expanded */}
        {expandedRows[employee.id] &&
          employee.projects &&
          employee.projects.map((project, projectIndex) => (
            <div
              key={`${employee.id}-project-${project.id}`}
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
                      deptIndex * employee.projects?.length +
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
                      getAttendanceStatus(employee.id, weekStart, project.id) === "full" ? "bg-green-500" :
                      getAttendanceStatus(employee.id, weekStart, project.id) === "moyen" ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      {getOccupationRate(
                        employee.id,
                        weekStart,
                        project.id
                      )}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </React.Fragment>
  );
};

export default ResourceCalendarRow;
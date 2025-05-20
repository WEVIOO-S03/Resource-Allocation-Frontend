import React from "react";
import { format, addDays } from "date-fns";

const CalendarHeader = ({
  title,
  count,
  calendarWeeks,
  weeksRowRef,
  handleColumnClick,
  isColumnSelected,
  isCurrentWeek,
  minWeekWidth = "140px",
  weekHeaderFormat = "detailed", 
}) => {
  return (
    <div className="flex bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="w-[300px] flex-shrink-0 px-4 py-3 font-medium text-gray-700 bg-white border-r border-gray-200">
        {title} ({count})
      </div>
      <div
        className={`flex ${weekHeaderFormat === "detailed" ? "flex-1" : ""} overflow-x-auto ${
          weekHeaderFormat === "detailed" ? "scrollbar-none" : "scrollbar-thin"
        }`}
        ref={weeksRowRef}
      >
        {calendarWeeks.map((weekStart, index) => {
          const weekEnd = addDays(weekStart, 6);
          return (
            <div
              key={index}
              style={{ minWidth: minWeekWidth, width: minWeekWidth }}
              className={`flex-shrink-0 flex flex-col items-center justify-center p-2 border-r border-gray-200 cursor-pointer hover:bg-gray-100 ${
                isColumnSelected(weekStart) ? "bg-blue-200" : ""
              } ${
                isCurrentWeek(weekStart)
                  ? weekHeaderFormat === "detailed"
                    ? "bg-blue-50 border-l-2 border-r-2 border-blue-500"
                    : "bg-yellow-200 border-l-2 border-r-2 border-blue-400"
                  : ""
              }`}
              onClick={() => handleColumnClick(weekStart)}
            >
              {weekHeaderFormat === "detailed" ? (
                <>
                  <div className="font-semibold text-sm">Week {format(weekStart, "w")}</div>
                  <div className="text-xs text-gray-500">
                    {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold">
                    {format(weekStart, "d")} - {format(weekEnd, "d")}
                  </div>
                  <div className="text-gray-500 text-xs">Week {format(weekStart, "w")}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarHeader;
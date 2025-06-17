import React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";

const MonthNavigator = ({ 
  currentDate, 
  setCurrentDate,
  className
}) => {
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  return (
    <div className={`flex items-center justify-between flex-wrap ${className || ""}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
          <button
            onClick={handlePrevMonth}
            className="px-1.5 py-1 hover:bg-gray-100 rounded"
          >
            &lt;
          </button>
          <span className="text-sm text-gray-700 min-w-[3rem] text-center">
            {format(currentDate, "yyyy")}
          </span>
          <button
            onClick={handleNextMonth}
            className="px-1.5 py-1 hover:bg-gray-100 rounded"
          >
            &gt;
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-thin py-1">
          {Array.from({ length: 12 }, (_, i) => {
            const monthDate = new Date(currentDate.getFullYear(), i);
            return (
              <button
                key={i}
                className={`text-sm px-2 py-1 whitespace-nowrap relative border-none bg-transparent flex-1 text-center ${
                  i === currentDate.getMonth()
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
                onClick={() =>
                  setCurrentDate(new Date(currentDate.getFullYear(), i))
                }
              >
                {format(monthDate, "MMM")}
                {i === currentDate.getMonth() && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 "></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="text-sm text-gray-700 min-w-[200px]">
        {format(startDate, "dd MMM yyyy")} -{" "}
        {format(endDate, "dd MMM yyyy")}
      </div>
    </div>
  );
};

export default MonthNavigator;
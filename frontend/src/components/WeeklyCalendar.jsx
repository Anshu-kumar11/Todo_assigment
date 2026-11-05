import React from "react";
import { CalendarDays } from "lucide-react";

const WeeklyCalendar = ({ weekDays = [], selectedDate, onSelectDate, getDateKey }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Weekly Calendar</h2>
          <p className="text-xs text-gray-400 mt-1">Select a date to view tasks</p>
        </div>
        <CalendarDays className="text-[#4563ED]" size={22} />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => {
          const dateKey = getDateKey ? getDateKey(date) : date.toISOString().split("T")[0];
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              onClick={() => onSelectDate?.(dateKey)}
              className={`flex flex-col items-center gap-2 py-3 rounded-xl transition cursor-pointer ${
                isSelected
                  ? "bg-[#4563ED] text-white shadow-md"
                  : "bg-gray-50 text-gray-500 hover:bg-blue-50"
              }`}
            >
              <span className="text-[10px] sm:text-xs">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-sm sm:text-base font-bold">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;

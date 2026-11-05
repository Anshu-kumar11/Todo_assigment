import React from "react";

const ProgressBar = ({ progress = 0, completed = 0, total = 0 }) => {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-900">Weekly Progress</h2>
        <span className="text-sm font-bold text-[#4563ED]">{progress}%</span>
      </div>

      <div className="w-full bg-[#E6E7FF] h-3 rounded-full overflow-hidden">
        <div
          className="bg-[#4563ED] h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {completed} of {total} tasks completed this week
      </p>
    </div>
  );
};

export default ProgressBar;


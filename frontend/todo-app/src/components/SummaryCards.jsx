import React from "react";
import { Check, Bell } from "lucide-react";

const SummaryCards = ({ completedTasks = 0, pendingTasks = 0 }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Completed */}
      <div className="bg-[#E9EDFF] p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[#4563ED] p-2 rounded-lg text-white">
            <Check size={18} />
          </div>
          <span className="text-xs sm:text-sm text-gray-600">Task Complete</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{completedTasks}</h2>
        <p className="text-xs text-gray-500 mt-1">This Week</p>
      </div>

      {/* Pending */}
      <div className="bg-[#FFEAEA] p-4 sm:p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-[#F16B6B] p-2 rounded-lg text-white">
            <Bell size={18} />
          </div>
          <span className="text-xs sm:text-sm text-gray-600">Task Pending</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">{pendingTasks}</h2>
        <p className="text-xs text-gray-500 mt-1">This Week</p>
      </div>
    </div>
  );
};

export default SummaryCards;


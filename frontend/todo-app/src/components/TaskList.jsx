import React from "react";
import { Plus } from "lucide-react";
import TaskItem from "./TaskItem";

const TaskList = ({
  tasks = [],
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 h-fit">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tasks Today</h2>
          <p className="text-xs text-gray-400 mt-1">
            {tasks.length} tasks found
          </p>
        </div>

        <button
          onClick={onAddTask}
          className="bg-[#4563ED] text-white p-3 rounded-xl hover:bg-blue-700 transition"
          aria-label="Add task"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">No tasks found.</p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full mt-7 bg-[#4563ED] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Add New Task
      </button>
    </div>
  );
};

export default TaskList;


import React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";

const TaskItem = ({ task, onToggle, onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      {/* Checkbox */}
      <button
        onClick={() => onToggle?.(task.id)}
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
          task.completed
            ? "bg-[#4563ED] border-[#4563ED] text-white"
            : "border-gray-300"
        }`}
        aria-label="Toggle task status"
      >
        {task.completed && <Check size={13} />}
      </button>

      {/* Task Title */}
      <span
        className={`flex-1 text-sm ${
          task.completed ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {task.title}
      </span>

      {/* Edit */}
      {onEdit && (
        <button
          onClick={() => onEdit(task)}
          className="text-gray-400 hover:text-[#4563ED]"
          aria-label="Edit task"
        >
          <Pencil size={16} />
        </button>
      )}

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500"
          aria-label="Delete task"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default TaskItem;


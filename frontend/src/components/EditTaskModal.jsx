import React, { useState } from "react";
import { X, Clock, CalendarDays, Flag, Save, Loader2 } from "lucide-react";

const EditTaskModal = ({ task, onClose, onUpdateTask }) => {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    date: task.date || "",
    startTime: task.startTime || task.time || "",
    endTime: task.endTime || "",
    priority: task.priority || "Medium",
    status: task.status || (task.completed ? "Completed" : "In Progress"),
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!formData.date) {
      setError("Please select a task date.");
      return;
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.endTime <= formData.startTime
    ) {
      setError("End time must be after start time.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onUpdateTask(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.startTime || task.time,
        startTime: formData.startTime,
        endTime: formData.endTime,
        priority: formData.priority,
        status: formData.status,
        completed: formData.status === "Completed",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-7 border-b border-gray-100">
          <div>
            <p className="text-xs text-[#4563ED] font-semibold uppercase tracking-wider">
              Task Management
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Edit Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4563ED]"
            />
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#4563ED]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#4563ED]"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CalendarDays size={16} />
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4563ED]"
            />
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {["In Progress", "Completed"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, status: st }))}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition ${
                      formData.status === st
                        ? "bg-[#4563ED] text-white border-[#4563ED]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Flag size={16} />
                Priority
              </label>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p }))}
                    className={`flex-1 py-2.5 rounded-lg border text-xs font-semibold transition ${
                      formData.priority === p
                        ? "bg-[#4563ED] text-white border-[#4563ED]"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none resize-none focus:border-[#4563ED]"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#4563ED] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;


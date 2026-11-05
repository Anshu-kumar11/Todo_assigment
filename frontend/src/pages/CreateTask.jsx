import { useState } from "react";
import { X, Clock, CalendarDays, Plus, Flag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const CreateTask = ({ onClose, onCreateTask, initialDate }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    date: initialDate || getToday(),
    description: "",
    priority: "Medium",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // Submit task
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

    if (!formData.startTime) {
      setError("Please enter a start time.");
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

    const newTask = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: formData.date,
      time: formData.startTime,
      startTime: formData.startTime,
      endTime: formData.endTime,
      priority: formData.priority,
    };

    try {
      setIsSubmitting(true);
      if (onCreateTask) {
        await onCreateTask(newTask);
      }
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-3 sm:p-6 cursor-default"
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-7 border-b border-gray-100">
          <div>
            <p className="text-xs text-[#4563ED] font-semibold uppercase tracking-wider">
              Task Management
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
              Add New Task
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer disabled:cursor-not-allowed transition"
            aria-label="Close form"
            disabled={isSubmitting}
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your task title"
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4563ED] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />
          </div>

          {/* Start and End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Start Time <span className="text-red-500">*</span>
              </label>

              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#4563ED] disabled:bg-gray-50 cursor-pointer"
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
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#4563ED] disabled:bg-gray-50 cursor-pointer"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CalendarDays size={16} />
              Select Date <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#4563ED] disabled:bg-gray-50 cursor-pointer"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Flag size={16} />
              Priority
            </label>

            <div className="grid grid-cols-3 gap-3">
              {["Low", "Medium", "High"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      priority,
                    }))
                  }
                  className={`py-3 rounded-lg border text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed ${
                    formData.priority === priority
                      ? "bg-[#4563ED] text-white border-[#4563ED]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#4563ED]"
                  }`}
                >
                  {priority}
                </button>
              ))}
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
              placeholder="Add task description..."
              rows={4}
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none resize-none focus:border-[#4563ED] disabled:bg-gray-50"
            />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#4563ED] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

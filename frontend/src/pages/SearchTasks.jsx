import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  ArrowLeft,
  Check,
  Clock,
  CalendarDays,
  Trash2,
  Pencil,
  Plus,
  X,
  Loader2,
  Wifi,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
// import { initialTasks } from "../data/dummyTasks";
import CreateTask from "./CreateTask";
import EditTaskModal from "../components/EditTaskModal";
import taskService from "../services/taskService";

const SearchTasks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState("all");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [apiHitCount, setApiHitCount] = useState(0);

  // Tasks returned directly from the API search
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("todo_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track the latest active request to avoid race conditions
  const searchRequestId = useRef(0);

  /**
   * Primary Search Function that directly hits the Backend API:
   * GET /api/tasks?search=<query>&status=<filter>
   * or GET /api/tasks/search?q=<query>
   */
  const executeApiSearch = useCallback(async (searchQuery, statusFilter) => {
    const currentReqId = ++searchRequestId.current;
    setIsSearching(true);

    try {
      const filters = {};
      const trimmedQuery = (searchQuery || "").trim();

      if (trimmedQuery) {
        filters.search = trimmedQuery;
      }

      if (statusFilter && statusFilter !== "all") {
        filters.status =
          statusFilter === "completed" ? "Completed" : "In Progress";
      }

      // Calls GET /api/tasks?search=...&status=...
      const data = await taskService.getTasks(filters);

      // Only update if this is still the latest request
      if (currentReqId === searchRequestId.current && Array.isArray(data)) {
        setTasks(data);
        setApiHitCount((prev) => prev + 1);
        try {
          // Keep local cache warm
          if (!trimmedQuery && statusFilter === "all") {
            localStorage.setItem("todo_tasks", JSON.stringify(data));
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn(
        "Backend API search failed, falling back to local search:",
        err.message,
      );
      // Fallback local search if backend is offline
      try {
        const saved = localStorage.getItem("todo_tasks");
        const allLocal = saved ? JSON.parse(saved) : [];
        const q = (searchQuery || "").trim().toLowerCase();
        const filtered = allLocal.filter((task) => {
          const matchesQuery =
            !q ||
            task.title?.toLowerCase().includes(q) ||
            task.description?.toLowerCase().includes(q);
          const matchesStatus =
            statusFilter === "all"
              ? true
              : statusFilter === "completed"
                ? task.completed || task.status === "Completed"
                : !task.completed && task.status !== "Completed";
          return matchesQuery && matchesStatus;
        });
        setTasks(filtered);
      } catch {
        // ignore
      }
    } finally {
      if (currentReqId === searchRequestId.current) {
        setIsSearching(false);
      }
    }
  }, []);

  // Debounced API search effect: triggers on every keystroke in `query` or change in `filter`
  useEffect(() => {
    const timer = setTimeout(() => {
      executeApiSearch(query, filter);
      // Update URL query parameter
      if (query.trim()) {
        setSearchParams({ q: query.trim() }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filter, executeApiSearch, setSearchParams]);

  // Handle immediate search (e.g. on Enter key)
  const handleImmediateSearch = (e) => {
    if (e.key === "Enter") {
      executeApiSearch(query, filter);
    }
  };

  // Clear search input and hit API for full list
  const handleClearSearch = () => {
    setQuery("");
    executeApiSearch("", filter);
  };

  // Toggle task completed / in progress
  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => (t.id || t._id) === id);
    if (!task) return;

    const newCompleted = !(task.completed || task.status === "Completed");
    const newStatus = newCompleted ? "Completed" : "In Progress";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        (t.id || t._id) === id
          ? { ...t, completed: newCompleted, status: newStatus }
          : t,
      ),
    );

    try {
      await taskService.updateTaskStatus(id, newStatus);
      // Refresh search results from API
      executeApiSearch(query, filter);
    } catch {
      // ignore
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => (t.id || t._id) !== id));
    try {
      await taskService.deleteTask(id);
      // Refresh search results from API
      executeApiSearch(query, filter);
    } catch {
      // ignore
    }
  };

  // Add new task
  const handleCreateTask = async (newTaskData) => {
    try {
      await taskService.createTask(newTaskData);
      executeApiSearch(query, filter);
    } catch {
      const localTask = {
        ...newTaskData,
        id: `local_${Date.now()}`,
        status: "In Progress",
        completed: false,
      };
      setTasks((prev) => [localTask, ...prev]);
    }
  };

  // Update task
  const handleUpdateTask = async (id, updates) => {
    try {
      await taskService.updateTask(id, updates);
      executeApiSearch(query, filter);
    } catch {
      setTasks((prev) =>
        prev.map((t) => ((t.id || t._id) === id ? { ...t, ...updates } : t)),
      );
    }
  };

  const allCount = tasks.length;
  const completedCount = tasks.filter(
    (t) => t.completed || t.status === "Completed",
  ).length;
  const inProgressCount = tasks.filter(
    (t) => !t.completed && t.status !== "Completed",
  ).length;

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 bg-white rounded-xl shadow-sm text-gray-600 hover:text-[#4563ED] hover:shadow transition"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  All Tasks & Search
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Live backend search across titles, descriptions, and statuses
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-[#4563ED] text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Plus size={18} />
            Add New Task
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          {isSearching ? (
            <Loader2
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4563ED] animate-spin"
            />
          ) : (
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleImmediateSearch}
            placeholder="Search tasks by title, description, or status..."
            className="w-full bg-white rounded-xl py-4 pl-12 pr-28 outline-none border border-gray-100 focus:border-[#4563ED] focus:ring-2 focus:ring-blue-100 shadow-sm text-sm"
            autoFocus
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                onClick={handleClearSearch}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs (Trigger Live API Calls) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === "all"
                ? "bg-[#4563ED] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            All ({allCount})
          </button>

          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === "pending"
                ? "bg-[#4563ED] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            In Progress ({inProgressCount})
          </button>

          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === "completed"
                ? "bg-[#4563ED] text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Tasks Container */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-7">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} returned
              from API
            </span>
            {query && (
              <span className="text-xs text-[#4563ED] font-medium">
                Matching &quot;{query}&quot;
              </span>
            )}
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const taskId = task.id || task._id;
                const isCompleted =
                  task.completed || task.status === "Completed";

                return (
                  <div
                    key={taskId}
                    className="flex items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(taskId)}
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                          isCompleted
                            ? "bg-[#4563ED] border-[#4563ED] text-white"
                            : "border-gray-300 hover:border-[#4563ED]"
                        }`}
                        aria-label="Toggle task status"
                      >
                        {isCompleted && <Check size={13} />}
                      </button>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-semibold break-words ${
                              isCompleted
                                ? "line-through text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </span>

                          {task.priority && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                task.priority === "High"
                                  ? "bg-red-50 text-red-600"
                                  : task.priority === "Medium"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1 flex-wrap">
                          {task.date && (
                            <span className="flex items-center gap-1">
                              <CalendarDays size={13} />
                              {task.date}
                            </span>
                          )}

                          {task.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={13} />
                              {task.startTime}
                              {task.endTime ? ` - ${task.endTime}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium hidden sm:inline-block mr-1 ${
                          isCompleted
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isCompleted ? "Done" : "In Progress"}
                      </span>

                      <button
                        onClick={() => setEditingTask(task)}
                        className="text-gray-400 hover:text-[#4563ED] p-1.5 rounded-lg hover:bg-gray-50 transition"
                        aria-label="Edit task"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteTask(taskId)}
                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition"
                        aria-label="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">
                  {query
                    ? `No tasks found in database matching "${query}".`
                    : "No tasks available."}
                </p>
                {query && (
                  <button
                    onClick={handleClearSearch}
                    className="mt-3 text-xs text-[#4563ED] font-semibold hover:underline"
                  >
                    Clear search query
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTask
          onClose={() => setShowCreateTask(false)}
          onCreateTask={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default SearchTasks;

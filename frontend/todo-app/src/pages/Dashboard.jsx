import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Check,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateTask from "./CreateTask";
import EditTaskModal from "../components/EditTaskModal";
import taskService from "../services/taskService";
// import { initialTasks } from "../data/dummyTasks";

// Get date in YYYY-MM-DD format
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Generate Monday to Sunday dates
const getWeekDays = () => {
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return date;
  });
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Modals state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Data states
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("todo_tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [weeklyOverview, setWeeklyOverview] = useState([]);
  const [expandedWeekId, setExpandedWeekId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getDateKey(new Date()));
  const [search, setSearch] = useState("");
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = useMemo(() => getWeekDays(), []);

  // Fetch data from backend API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedTasks, fetchedWeekly] = await Promise.all([
        taskService.getTasks(),
        taskService.getWeeklyOverview(),
      ]);

      if (Array.isArray(fetchedTasks)) {
        setTasks(fetchedTasks);
        try {
          localStorage.setItem("todo_tasks", JSON.stringify(fetchedTasks));
        } catch {
          // ignore storage error
        }
      }

      if (Array.isArray(fetchedWeekly)) {
        setWeeklyOverview(fetchedWeekly);
        // Default expanded week to current week
        const currentWeek = fetchedWeekly.find((w) => w.isCurrentWeek);
        if (currentWeek) {
          setExpandedWeekId(currentWeek.weekId);
        }
      }

      setIsBackendConnected(true);
    } catch (err) {
      console.warn(
        "Backend API not reachable, using local storage:",
        err.message,
      );
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live API search for Dashboard when typing in search bar
  useEffect(() => {
    if (!search.trim()) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await taskService.getTasks({ search: search.trim() });
        if (Array.isArray(results)) {
          setTasks(results);
        }
      } catch (err) {
        console.warn("Dashboard search error:", err.message);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // When search input is cleared, reload data
  useEffect(() => {
    if (search === "") {
      loadData();
    }
  }, [search, loadData]);

  // Handler to open CreateTask modal
  const handleOpenAddTask = () => {
    setShowCreateTask(true);
  };

  // Navigate to View All Tasks / Search page
  const handleViewAllTasks = () => {
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/search");
    }
  };

  // Toggle task complete / in progress
  const handleToggleTask = async (id) => {
    const taskToToggle = tasks.find((t) => t.id === id);
    if (!taskToToggle) return;

    const newCompleted = !taskToToggle.completed;
    const newStatus = newCompleted ? "Completed" : "In Progress";

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: newCompleted, status: newStatus } : t,
      ),
    );

    try {
      await taskService.updateTaskStatus(id, newStatus);
      // Refresh weekly overview to accurately reflect open/closed counts
      const updatedWeekly = await taskService.getWeeklyOverview();
      setWeeklyOverview(updatedWeekly);
    } catch {
      // Local storage fallback sync
      try {
        const updated = tasks.map((t) =>
          t.id === id
            ? { ...t, completed: newCompleted, status: newStatus }
            : t,
        );
        localStorage.setItem("todo_tasks", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  // Create new task
  const handleCreateTask = async (newTaskData) => {
    try {
      const created = await taskService.createTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
      if (created.date) {
        setSelectedDate(created.date);
      }
      const updatedWeekly = await taskService.getWeeklyOverview();
      setWeeklyOverview(updatedWeekly);
    } catch (err) {
      console.warn("API create failed, saving locally:", err.message);
      const localTask = {
        ...newTaskData,
        id: `local_${Date.now()}`,
        status: "In Progress",
        completed: false,
      };
      setTasks((prev) => [localTask, ...prev]);
      if (localTask.date) {
        setSelectedDate(localTask.date);
      }
    }
  };

  // Update existing task
  const handleUpdateTask = async (id, updates) => {
    try {
      const updated = await taskService.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      const updatedWeekly = await taskService.getWeeklyOverview();
      setWeeklyOverview(updatedWeekly);
    } catch (err) {
      console.warn("API update failed, updating locally:", err.message);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    // Optimistic UI update
    setTasks((prev) => prev.filter((task) => task.id !== id));

    try {
      await taskService.deleteTask(id);
      const updatedWeekly = await taskService.getWeeklyOverview();
      setWeeklyOverview(updatedWeekly);
    } catch (err) {
      console.warn("API delete failed, updating locally:", err.message);
    }
  };

  // Filter tasks for selected date & search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesDate = task.date === selectedDate;
      const matchesSearch =
        !search.trim() ||
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      return matchesDate && matchesSearch;
    });
  }, [tasks, selectedDate, search]);

  // Weekly task summary for current week
  const weeklyTasks = useMemo(() => {
    const weekDates = weekDays.map(getDateKey);
    return tasks.filter((task) => weekDates.includes(task.date));
  }, [tasks, weekDays]);

  const completedTasks = weeklyTasks.filter((task) => task.completed).length;
  const pendingTasks = weeklyTasks.filter((task) => !task.completed).length;
  const totalTasks = weeklyTasks.length;
  const progress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              My Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleViewAllTasks}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2"
            >
              <Search size={16} />
              Search All Tasks
            </button>

            <button
              onClick={handleOpenAddTask}
              className="bg-[#4563ED] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Main Section (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar + View All Tasks Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleViewAllTasks();
                    }
                  }}
                  className="w-full bg-white rounded-xl py-4 pl-12 pr-4 outline-none border border-gray-100 focus:border-[#4563ED] shadow-sm text-sm"
                />
              </div>

              <button
                onClick={handleViewAllTasks}
                className="bg-white hover:bg-[#4563ED] hover:text-white text-[#4563ED] border border-blue-100 font-semibold text-xs sm:text-sm px-4 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                View All Tasks
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Weekly Calendar */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="font-bold text-gray-900">Weekly Calendar</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Select a date to view and manage tasks
                  </p>
                </div>

                <CalendarDays className="text-[#4563ED]" size={22} />
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date) => {
                  const dateKey = getDateKey(date);
                  const isSelected = selectedDate === dateKey;
                  const dayTaskCount = tasks.filter(
                    (t) => t.date === dateKey,
                  ).length;

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(dateKey)}
                      className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition relative ${
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

                      {dayTaskCount > 0 && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white" : "bg-[#4563ED]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Completed */}
              <div className="bg-[#E9EDFF] p-4 sm:p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-[#4563ED] p-2 rounded-lg text-white">
                    <Check size={18} />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Task Complete
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {completedTasks}
                </h2>
                <p className="text-xs text-gray-500 mt-1">This Week</p>
              </div>

              {/* Pending / In Progress */}
              <div className="bg-[#FFEAEA] p-4 sm:p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-[#F16B6B] p-2 rounded-lg text-white">
                    <Clock size={18} />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 font-medium">
                    Task In Progress
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {pendingTasks}
                </h2>
                <p className="text-xs text-gray-500 mt-1">This Week</p>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900">Weekly Progress</h2>
                <span className="text-sm font-bold text-[#4563ED]">
                  {progress}%
                </span>
              </div>

              <div className="w-full bg-[#E6E7FF] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#4563ED] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-gray-400 mt-3">
                {completedTasks} of {totalTasks} tasks completed this week
              </p>
            </div>
          </div>

          {/* Right Task Section (col-span-1) */}
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 h-fit space-y-6">
            <div className="flex justify-between items-center gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Tasks for Date
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  {filteredTasks.length}{" "}
                  {filteredTasks.length === 1 ? "task" : "tasks"} on{" "}
                  {selectedDate}
                </p>
              </div>

              <button
                onClick={handleViewAllTasks}
                className="text-xs font-semibold text-[#4563ED] hover:text-white hover:bg-[#4563ED] bg-blue-50 px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-blue-100 shadow-sm shrink-0"
              >
                View All
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Task List for Selected Date */}
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    {/* Checkbox status toggle */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                        task.completed
                          ? "bg-[#4563ED] border-[#4563ED] text-white"
                          : "border-gray-300 hover:border-[#4563ED]"
                      }`}
                      aria-label="Toggle task status"
                    >
                      {task.completed && <Check size={13} />}
                    </button>

                    {/* Task Title & Details */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-sm block truncate ${
                          task.completed
                            ? "line-through text-gray-400"
                            : "text-gray-700 font-medium"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.startTime && (
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> {task.startTime}
                          {task.endTime ? ` - ${task.endTime}` : ""}
                        </span>
                      )}
                    </div>

                    {/* Priority badge */}
                    {task.priority && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
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

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-gray-400 hover:text-[#4563ED] p-1 rounded hover:bg-gray-50"
                      aria-label="Edit task"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-gray-50"
                      aria-label="Delete task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">
                    No tasks on this date.
                  </p>
                  <button
                    onClick={handleOpenAddTask}
                    className="mt-2 text-xs text-[#4563ED] font-semibold hover:underline"
                  >
                    + Create a task for {selectedDate}
                  </button>
                </div>
              )}
            </div>

            {/* Add Task Button */}
            <button
              onClick={handleOpenAddTask}
              className="w-full mt-7 bg-[#4563ED] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
              aria-label="Add new task"
            >
              <Plus size={20} />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        {/* Section 3.2: Weekly Organization & Summary Cards (Monday to Sunday) */}
        <section className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="text-[#4563ED]" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Weekly Organization Overview
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Weeks start on Monday and end on Sunday. Tap any week card to
                expand its tasks.
              </p>
            </div>
          </div>

          {/* Weekly Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {weeklyOverview.map((week) => {
              const isExpanded = expandedWeekId === week.weekId;
              const weekProgress = week.totalTasks
                ? Math.round((week.completedTasks / week.totalTasks) * 100)
                : 0;

              return (
                <div
                  key={week.weekId}
                  className={`border rounded-2xl p-5 transition-all cursor-pointer ${
                    isExpanded
                      ? "border-[#4563ED] bg-blue-50/20 shadow-md ring-1 ring-[#4563ED]/20"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                  }`}
                  onClick={() =>
                    setExpandedWeekId(isExpanded ? null : week.weekId)
                  }
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-gray-900">
                      {week.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {week.isCurrentWeek && (
                        <span className="bg-[#4563ED] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Open vs Completed metrics */}
                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 my-2">
                    <div className="bg-[#FFEAEA] p-3 rounded-xl">
                      <span className="text-[11px] text-gray-500 font-medium block">
                        Open Tasks
                      </span>
                      <span className="text-xl font-bold text-red-600">
                        {week.openTasks}
                      </span>
                    </div>

                    <div className="bg-[#E9EDFF] p-3 rounded-xl">
                      <span className="text-[11px] text-gray-500 font-medium block">
                        Completed
                      </span>
                      <span className="text-xl font-bold text-[#4563ED]">
                        {week.completedTasks}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className="font-semibold text-gray-700">
                        {weekProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4563ED] h-full rounded-full transition-all duration-300"
                        style={{ width: `${weekProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Task List View */}
                  {isExpanded && (
                    <div
                      className="mt-5 pt-4 border-t border-gray-200 space-y-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Week Tasks ({week.tasks.length})
                      </p>

                      {week.tasks.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {week.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 shadow-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                    task.status === "Completed" ||
                                    task.completed
                                      ? "bg-[#4563ED] border-[#4563ED] text-white"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {(task.status === "Completed" ||
                                    task.completed) && <Check size={11} />}
                                </button>
                                <div className="truncate">
                                  <span
                                    className={`text-xs block truncate ${
                                      task.status === "Completed" ||
                                      task.completed
                                        ? "line-through text-gray-400"
                                        : "text-gray-800 font-medium"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {task.date}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="text-gray-400 hover:text-[#4563ED] p-1"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-gray-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 py-3 text-center">
                          No tasks scheduled for this week.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTask
          initialDate={selectedDate}
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

export default Dashboard;

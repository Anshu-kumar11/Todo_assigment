import taskRepository from "../repositories/taskRepository.js";
import {
  formatDateKey,
  getWeekId,
  getWeekLabel,
  getMondayOfWeek,
  getSundayOfWeek,
  isCurrentWeek,
} from "../utils/dateUtils.js";

// Initial seed data generator
const getInitialSeedTasks = () => {
  const today = new Date();
  const todayKey = formatDateKey(today);

  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(today.getDate() + 7);
  const nextWeekKey = formatDateKey(nextWeekDate);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  return [
    {
      title: "Finishing Wireframe",
      description:
        "Finalize mobile and desktop UI wireframes for client sign-off",
      date: todayKey,
      time: "09:00",
      startTime: "09:00",
      endTime: "10:30",
      priority: "High",
      status: "In Progress",
      completed: false,
      weekId: getWeekId(todayKey),
    },
    {
      title: "Meeting with product team",
      description:
        "Discuss weekly sprint deliverables and technical architecture",
      date: todayKey,
      time: "11:00",
      startTime: "11:00",
      endTime: "12:00",
      priority: "Medium",
      status: "In Progress",
      completed: false,
      weekId: getWeekId(todayKey),
    },
    {
      title: "Buy nutritious cat food",
      description: "Stop by the pet store after lunch to buy wet canned food",
      date: todayKey,
      time: "16:00",
      startTime: "16:00",
      endTime: "16:30",
      priority: "Low",
      status: "Completed",
      completed: true,
      weekId: getWeekId(todayKey),
    },
    {
      title: "Complete daily commission tasks",
      description: "Review and respond to pending customer support tickets",
      date: yesterdayKey,
      time: "17:00",
      startTime: "17:00",
      endTime: "18:00",
      priority: "Medium",
      status: "Completed",
      completed: true,
      weekId: getWeekId(yesterdayKey),
    },
    {
      title: "Deploy API to production",
      description: "Set up CI/CD pipeline and verify health check endpoints",
      date: nextWeekKey,
      time: "14:00",
      startTime: "14:00",
      endTime: "15:30",
      priority: "High",
      status: "In Progress",
      completed: false,
      weekId: getWeekId(nextWeekKey),
    },
  ];
};

class TaskService {
  /**
   * Seed tasks if database is empty
   */
  async initializeSeeds() {
    try {
      await taskRepository.seedIfEmpty(getInitialSeedTasks());
    } catch (err) {
      console.warn("Could not seed initial tasks:", err.message);
    }
  }

  async getAllTasks(filters = {}) {
    const query = {};

    // Search keyword in title or description
    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Status filter
    if (filters.status) {
      const normalized = filters.status.toLowerCase();
      if (normalized === "open" || normalized === "in progress") {
        query.status = "In Progress";
      } else if (normalized === "completed") {
        query.status = "Completed";
      }
    }

    // Priority filter
    if (filters.priority) {
      query.priority = filters.priority;
    }

    // Date filters
    if (filters.date) {
      query.date = filters.date;
    }

    if (filters.weekId) {
      query.weekId = filters.weekId;
    }

    if (filters.startDate || filters.endDate) {
      query.date = query.date || {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    return await taskRepository.findAll(query);
  }

  async getTaskById(id) {
    return await taskRepository.findById(id);
  }

  async createTask(taskData) {
    const dateKey = taskData.date
      ? formatDateKey(taskData.date)
      : formatDateKey();
    const isCompleted =
      taskData.status === "Completed" || Boolean(taskData.completed);
    const status = isCompleted
      ? "Completed"
      : taskData.status === "Open"
        ? "In Progress"
        : taskData.status || "In Progress";

    const payload = {
      ...taskData,
      title: taskData.title.trim(),
      description: (taskData.description || "").trim(),
      date: dateKey,
      time: taskData.time || taskData.startTime || "09:00",
      startTime: taskData.startTime || taskData.time || "09:00",
      endTime: taskData.endTime || "",
      priority: taskData.priority || "Medium",
      status: status,
      completed: isCompleted,
      weekId: getWeekId(dateKey),
    };

    return await taskRepository.create(payload);
  }

  async updateTask(id, updateData) {
    const updates = { ...updateData };

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    if (updates.date) {
      updates.date = formatDateKey(updates.date);
      updates.weekId = getWeekId(updates.date);
    }

    if (updates.status !== undefined) {
      if (updates.status === "Open") updates.status = "In Progress";
      updates.completed = updates.status === "Completed";
    } else if (updates.completed !== undefined) {
      updates.completed = Boolean(updates.completed);
      updates.status = updates.completed ? "Completed" : "In Progress";
    }

    return await taskRepository.update(id, updates);
  }

  async updateTaskStatus(id, targetStatusOrCompleted) {
    let targetStatus;

    if (targetStatusOrCompleted !== undefined) {
      if (typeof targetStatusOrCompleted === "boolean") {
        targetStatus = targetStatusOrCompleted ? "Completed" : "In Progress";
      } else {
        targetStatus =
          targetStatusOrCompleted === "Open"
            ? "In Progress"
            : targetStatusOrCompleted;
      }
    } else {
      // Toggle current status
      const existing = await taskRepository.findById(id);
      if (!existing) return null;
      targetStatus =
        existing.status === "Completed" ? "In Progress" : "Completed";
    }

    const updates = {
      status: targetStatus,
      completed: targetStatus === "Completed",
    };

    return await taskRepository.update(id, updates);
  }

  async deleteTask(id) {
    const deleted = await taskRepository.delete(id);
    return Boolean(deleted);
  }

  async getWeeklyOverview() {
    const tasks = await taskRepository.findAll({}, { date: 1, startTime: 1 });

    const weekMap = new Map();

    // Ensure current week is always present
    const currentWeekDate = new Date();
    const currentWeekKey = getWeekId(currentWeekDate);
    const currentMonday = getMondayOfWeek(currentWeekDate);
    const currentSunday = getSundayOfWeek(currentWeekDate);

    weekMap.set(currentWeekKey, {
      weekId: currentWeekKey,
      label: getWeekLabel(currentWeekDate),
      startDate: formatDateKey(currentMonday),
      endDate: formatDateKey(currentSunday),
      isCurrentWeek: true,
      openTasks: 0,
      completedTasks: 0,
      totalTasks: 0,
      tasks: [],
    });

    for (const task of tasks) {
      const taskDate = task.date;
      const weekId = task.weekId || getWeekId(taskDate);

      if (!weekMap.has(weekId)) {
        const monday = getMondayOfWeek(taskDate);
        const sunday = getSundayOfWeek(taskDate);

        weekMap.set(weekId, {
          weekId: weekId,
          label: getWeekLabel(taskDate),
          startDate: formatDateKey(monday),
          endDate: formatDateKey(sunday),
          isCurrentWeek: isCurrentWeek(taskDate),
          openTasks: 0,
          completedTasks: 0,
          totalTasks: 0,
          tasks: [],
        });
      }

      const weekEntry = weekMap.get(weekId);
      weekEntry.tasks.push(task);
      weekEntry.totalTasks += 1;

      if (task.status === "Completed" || task.completed) {
        weekEntry.completedTasks += 1;
      } else {
        weekEntry.openTasks += 1;
      }
    }

    // Sort weeks chronologically by startDate
    return Array.from(weekMap.values()).sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }
}

export default new TaskService();

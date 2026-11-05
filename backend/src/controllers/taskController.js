import taskService from "../services/taskService.js";

export const getTasks = async (req, res, next) => {
  try {
    const { search, q, status, priority, date, weekId, startDate, endDate } =
      req.query;

    const queryTerm = search || q;
    console.log(
      `[Backend API] GET /api/tasks (search: "${queryTerm || ""}", status: "${status || "all"}")`
    );

    const filters = {
      search: queryTerm,
      status,
      priority,
      date,
      weekId,
      startDate,
      endDate,
    };

    const tasks = await taskService.getAllTasks(filters);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyOverview = async (req, res, next) => {
  try {
    const weeklySummary = await taskService.getWeeklyOverview();

    res.status(200).json({
      success: true,
      count: weeklySummary.length,
      data: weeklySummary,
    });
  } catch (error) {
    next(error);
  }
};

export const searchTasks = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.search || "";
    const { status, priority, date, weekId } = req.query;

    console.log(
      `[Backend API] GET /api/tasks/search hit with query: "${query}", status: "${status || "all"}"`
    );

    const tasks = await taskService.getAllTasks({
      search: query,
      status,
      priority,
      date,
      weekId,
    });

    res.status(200).json({
      success: true,
      query,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await taskService.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const newTask = await taskService.createTask(req.body);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await taskService.updateTask(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, completed } = req.body;

    const target = status !== undefined ? status : completed;
    const updated = await taskService.updateTaskStatus(id, target);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Task status updated to ${updated.status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

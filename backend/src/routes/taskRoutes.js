import { Router } from "express";
import {
  getTasks,
  getWeeklyOverview,
  searchTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";
import {
  validateCreateTask,
  validateUpdateTask,
} from "../middleware/validateTask.js";

const router = Router();

//  Weekly overview
router.get("/weekly", getWeeklyOverview);

//  Keyword search route (placed before :id route)
router.get("/search", searchTasks);

//  Get all tasks (filters: search, status, priority, date, weekId)
router.get("/", getTasks);

//  Create new task
router.post("/", validateCreateTask, createTask);

//  Get single task by ID
router.get("/:id", getTaskById);

//  Full update task
router.put("/:id", validateUpdateTask, updateTask);

//  Partial update task
router.patch("/:id", validateUpdateTask, updateTask);

//  Update task status (Completed / In Progress)
router.patch("/:id/status", updateTaskStatus);

//  Delete task
router.delete("/:id", deleteTask);

export default router;

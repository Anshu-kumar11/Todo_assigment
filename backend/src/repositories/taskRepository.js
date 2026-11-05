import Task from "../models/taskModel.js";
import mongoose from "mongoose";

class TaskRepository {
  async findAll(query = {}, sort = { createdAt: -1 }) {
    return await Task.find(query).sort(sort);
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Task.findById(id);
  }

  async create(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  async update(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Task.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
      runValidators: true,
    });
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Task.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return await Task.countDocuments(query);
  }
}

export default new TaskRepository();

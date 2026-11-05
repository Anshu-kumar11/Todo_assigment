import mongoose from "mongoose";
import { getWeekId } from "../utils/dateUtils.js";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is mandatory"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: String,
      required: [true, "Task date is mandatory (YYYY-MM-DD)"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Task time is mandatory"],
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
      default: "",
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be Low, Medium, or High",
      },
      default: "Medium",
    },
    status: {
      type: String,
      enum: {
        values: ["In Progress", "Completed", "Open"],
        message: "Status must be In Progress or Completed",
      },
      default: "In Progress",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    weekId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for id
taskSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Configure JSON serialization
taskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

taskSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

// Pre-save hook to auto-populate weekId and sync completed flag
taskSchema.pre("save", function () {
  if (this.date) {
    this.weekId = getWeekId(this.date);
  }
  if (!this.startTime && this.time) {
    this.startTime = this.time;
  }
  if (!this.time && this.startTime) {
    this.time = this.startTime;
  }
  if (this.status === "Open") {
    this.status = "In Progress";
  }
  this.completed = this.status === "Completed";
});

export const Task = mongoose.model("Task", taskSchema);
export default Task;

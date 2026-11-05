/**
 * Middleware to validate task creation payload
 * Requirements:
 * - Title: mandatory
 * - Date & Time: mandatory
 * - Priority: optional (Low, Medium, High)
 */
export const validateCreateTask = (req, res, next) => {
  const { title, date, time, startTime, priority, status } = req.body;
  const errors = [];

  // Title validation
  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Title is mandatory and cannot be empty.");
  }

  // Date validation
  if (!date || typeof date !== "string" || !date.trim()) {
    errors.push("Date is mandatory.");
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Date must be a valid date string (e.g. YYYY-MM-DD).");
    }
  }

  // Time validation
  const taskTime = time || startTime;
  if (!taskTime || typeof taskTime !== "string" || !taskTime.trim()) {
    errors.push("Time is mandatory (e.g. '09:00' or startTime).");
  }

  // Priority validation (optional)
  if (priority && !["Low", "Medium", "High"].includes(priority)) {
    errors.push("Priority must be one of 'Low', 'Medium', or 'High'.");
  }

  // Status validation (optional)
  if (status && !["In Progress", "Completed", "Open"].includes(status)) {
    errors.push("Status must be 'In Progress' or 'Completed'.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

/**
 * Middleware to validate task update payload
 */
export const validateUpdateTask = (req, res, next) => {
  const { title, date, priority, status, startTime, endTime } = req.body;
  const errors = [];

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      errors.push("Title cannot be empty.");
    }
  }

  if (date !== undefined) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push("Date must be a valid date string.");
    }
  }

  if (priority !== undefined && !["Low", "Medium", "High"].includes(priority)) {
    errors.push("Priority must be one of 'Low', 'Medium', or 'High'.");
  }

  if (
    status !== undefined &&
    !["In Progress", "Completed", "Open"].includes(status)
  ) {
    errors.push("Status must be 'In Progress' or 'Completed'.");
  }

  if (startTime && endTime && endTime <= startTime) {
    errors.push("End time must be after start time.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};


const getApiBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof process !== "undefined" && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to handle fetch responses and error parsing
 */
const handleResponse = async (res) => {
  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage =
        errorData.message ||
        (errorData.errors && errorData.errors.join(", ")) ||
        errorMessage;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }
  return res.json();
};

export const taskService = {
  /**
   * Fetch all tasks with optional filters (search, status, priority, date, weekId)
   */
  async getTasks(filters = {}) {
    const baseUrl = getApiBaseUrl();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const endpoint = `${baseUrl}/tasks${queryString}`;
    console.log(`[taskService] Hitting GET tasks: ${endpoint}`);
    const res = await fetch(endpoint);
    const data = await handleResponse(res);
    return data.data || [];
  },

  /**
   * Fetch weekly overview summary cards (Monday to Sunday)
   */
  async getWeeklyOverview() {
    const baseUrl = getApiBaseUrl();
    const endpoint = `${baseUrl}/tasks/weekly`;
    console.log(`[taskService] Hitting GET weekly: ${endpoint}`);
    const res = await fetch(endpoint);
    const data = await handleResponse(res);
    return data.data || [];
  },

  /**
   * Explicitly search tasks by keyword and optional filters
   * Calls: GET /api/tasks/search?q=<keyword>&status=<status>
   */
  async searchTasks(keyword = "", filters = {}) {
    const baseUrl = getApiBaseUrl();
    const params = new URLSearchParams();
    if (keyword !== undefined && keyword !== null && String(keyword).trim() !== "") {
      params.append("q", String(keyword).trim());
      params.append("search", String(keyword).trim());
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const endpoint = `${baseUrl}/tasks/search${queryString}`;
    console.log(`[taskService] Hitting SEARCH endpoint: ${endpoint}`);
    const res = await fetch(endpoint);
    const data = await handleResponse(res);
    return data.data || [];
  },

  /**
   * Fetch single task by ID
   */
  async getTaskById(id) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/tasks/${id}`);
    const data = await handleResponse(res);
    return data.data;
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  /**
   * Update full/partial task attributes
   */
  async updateTask(id, updates) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  /**
   * Toggle or update task status ('In Progress' / 'Completed')
   */
  async updateTaskStatus(id, statusOrCompleted) {
    const baseUrl = getApiBaseUrl();
    const payload =
      typeof statusOrCompleted === "boolean"
        ? {
            completed: statusOrCompleted,
            status: statusOrCompleted ? "Completed" : "In Progress",
          }
        : { status: statusOrCompleted };

    const res = await fetch(`${baseUrl}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    return data.data;
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(id) {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/tasks/${id}`, {
      method: "DELETE",
    });
    const data = await handleResponse(res);
    return data.success;
  },

  /**
   * Check backend health
   */
  async checkHealth() {
    const baseUrl = getApiBaseUrl();
    try {
      const res = await fetch(`${baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

export default taskService;

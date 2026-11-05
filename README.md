# 📝 Todo & Task Management App

A full-stack task management application with weekly organization, interactive calendar, progress tracking, and live search.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Tailwind CSS, Vite, Lucide Icons, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Make sure your `backend/.env` has:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
# Start server
npm run dev
```

> Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Make sure your `frontend/.env` has:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
# Start client
npm run dev
```

> Open in browser: `http://localhost:5173`

---

## ✨ Features

- 📅 **Weekly Calendar:** Browse tasks day by day (Monday to Sunday).
- 📊 **Weekly Overview:** Progress bar and open vs completed task counts.
- ⚡ **CRUD Operations:** Create, edit, toggle, and delete tasks.
- 🔍 **Live Search:** Fast debounced search by title and description.
- 🏷️ **Filters:** Filter tasks by status (All, In Progress, Completed) and priority (Low, Medium, High).
- 📱 **Responsive UI:** Clean modern design with smooth cursor interactions on all devices.

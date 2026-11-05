# Todo App Backend API (Mongoose & Layered Architecture)

A structured, production-ready MERN stack backend built with Node.js, Express, and Mongoose implementing an enterprise 3-tier Layered Architecture: **Controller Layer &rarr; Service Layer &rarr; Repository Layer &rarr; Mongoose Model**.

---

## 🏛️ Layered Architecture Pattern

```
HTTP Request
     │
     ▼
┌────────────────────────────────────────┐
│           Controller Layer             │  src/controllers/taskController.js
│  - Parses HTTP request & query params  │
│  - Returns formatted JSON responses    │
│  - Delegates to Service Layer          │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│            Service Layer               │  src/services/taskService.js
│  - Business logic & week calculations  │
│  - Monday-Sunday week grouping         │
│  - Open vs Completed metrics           │
│  - Delegates to Repository Layer       │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│           Repository Layer             │  src/repositories/taskRepository.js
│  - Isolates data access operations     │
│  - Direct Mongoose database queries    │
│  - find, findById, create, update, etc │
└──────────────────┬─────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────┐
│            Mongoose Model              │  src/models/taskModel.js
│  - Task Schema with validations        │
│  - Automatic weekId & status syncing   │
│  - MongoDB Collection: tasks           │
└────────────────────────────────────────┘
```

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js             # Environment variables (PORT, MONGO_URI, CLIENT_URL)
│   │   └── dbConnection.js      # MongoDB connection via Mongoose
│   ├── models/
│   │   └── taskModel.js         # Mongoose Task Schema & Model
│   ├── repositories/
│   │   └── taskRepository.js    # Data Access Layer (Mongoose CRUD operations)
│   ├── services/
│   │   └── taskService.js       # Business Logic Layer (Week grouping, metrics)
│   ├── controllers/
│   │   └── taskController.js    # Transport Layer (Express request/response handling)
│   ├── routes/
│   │   └── taskRoutes.js        # Express route definitions
│   ├── middleware/
│   │   ├── errorHandler.js      # 404 & Global exception handlers
│   │   └── validateTask.js      # Request body validation (Title, Date, Time)
│   └── utils/
│       └── dateUtils.js         # Monday-Sunday week calculations & date formatting
├── server.js                    # HTTP Server entry point (Port 5000)
├── test-api.js                  # Standalone API integration tests
├── tests/                       # Automated unit & integration test suites
│   ├── dateUtils.test.js
│   ├── validateTask.test.js
│   ├── taskModel.test.js
│   └── taskRoutes.test.js
├── .env                         # Local environment variables
└── package.json                 # Dependencies and test scripts
```

---

## 💾 Mongoose Schema Attributes

| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `title` | `String` | Yes | Task title (mandatory) |
| `description` | `String` | No | Additional details |
| `date` | `String` | Yes | `YYYY-MM-DD` date |
| `time` | `String` | Yes | Task time (e.g. `09:00`) |
| `startTime` | `String` | No | Start time |
| `endTime` | `String` | No | End time |
| `priority` | `String` | No | `"Low"` \| `"Medium"` \| `"High"` (default: `"Medium"`) |
| `status` | `String` | No | `"In Progress"` \| `"Completed"` (default: `"In Progress"`) |
| `completed` | `Boolean`| No | Derived boolean synced with status |
| `weekId` | `String` | Auto | Monday-to-Sunday week ID (e.g. `2026-11-02_to_2026-11-08`) |
| `timestamps`| `Date` | Auto | `createdAt` and `updatedAt` |

---

## 🚀 Running the Server

```bash
# Start development server with auto-reload
npm run dev

# Run automated test suites
npm test
```

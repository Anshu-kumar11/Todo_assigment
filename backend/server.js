import dns from "node:dns";

// Fix MongoDB DNS resolution
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import app from "./src/app.js";
import { config } from "./src/config/index.js";
import connectDB from "./src/config/dbConnection.js";
import mongoose from "mongoose";

const PORT = config.port;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log("\nReceived kill signal, shutting down gracefully...");
      server.close(async () => {
        try {
          await mongoose.connection.close();
          console.log("MongoDB connection closed.");
        } catch (err) {
          console.error("Error closing MongoDB connection:", err.message);
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

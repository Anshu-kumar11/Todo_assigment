import mongoose from "mongoose";
import { config } from "./index.js";

const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

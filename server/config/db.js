import mongoose from "mongoose";
import env from "./env.js";

export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required. Add it to server/.env before starting StreamSphere.");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongodbUri, {
    autoIndex: env.nodeEnv !== "production"
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

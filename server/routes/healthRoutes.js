import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "StreamSphere API is healthy",
    data: {
      uptime: process.uptime(),
      mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    }
  });
});

export default router;

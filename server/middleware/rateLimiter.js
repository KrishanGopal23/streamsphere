import rateLimit from "express-rate-limit";
import env from "../config/env.js";

export const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down and try again."
  }
});

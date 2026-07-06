import env from "../config/env.js";

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.isOperational ? error.message : "Something went wrong",
    details: error.details || null
  };

  if (env.nodeEnv !== "production") {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
}

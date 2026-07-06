import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "./config/cors.js";
import env from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import apiRoutes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "32kb" }));
  app.use(express.urlencoded({ extended: true, limit: "32kb" }));
  app.use(compression());

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  }

  app.use("/api", apiLimiter, apiRoutes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import env from "./env.js";

const allowedOrigins = env.clientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
};

export { allowedOrigins };

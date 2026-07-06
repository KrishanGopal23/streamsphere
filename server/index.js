import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { allowedOrigins } from "./config/cors.js";
import { connectDatabase } from "./config/db.js";
import env from "./config/env.js";
import { registerSocketHandlers } from "./socket/index.js";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    },
    pingInterval: 25_000,
    pingTimeout: 20_000,
    transports: ["websocket", "polling"]
  });

  registerSocketHandlers(io);

  server.listen(env.port, () => {
    console.log(`StreamSphere API running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start StreamSphere API", error);
  process.exit(1);
});

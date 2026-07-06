import { io } from "socket.io-client";

export function createSocket() {
  return io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"]
  });
}

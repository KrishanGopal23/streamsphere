import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { createSocket } from "../socket/client.js";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socket = useMemo(() => createSocket(), []);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    socket.connect();

    function handleConnect() {
      setStatus("connected");
    }

    function handleDisconnect() {
      setStatus("disconnected");
    }

    function handleReconnectAttempt() {
      setStatus("reconnecting");
    }

    function handleError(error) {
      toast.error(error.message || "Realtime connection error");
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("socket-error", handleError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("socket-error", handleError);
      socket.disconnect();
    };
  }, [socket]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocketContext must be used inside SocketProvider");
  return context;
}

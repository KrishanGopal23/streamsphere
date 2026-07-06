import { useSocketContext } from "../context/SocketContext.jsx";

export function useSocket() {
  return useSocketContext();
}

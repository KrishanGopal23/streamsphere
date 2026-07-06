import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";
import { normalizeNickname, normalizeRoomId } from "../utils/sanitize.js";
import { createMessage, createSystemMessage } from "../services/messageService.js";
import {
  connectMember,
  disconnectMemberBySocket,
  kickMember,
  transferHost,
  updateRoomSettings,
  verifyRoomAccess
} from "../services/roomService.js";
import { addQueueItem, approveQueueItem, removeQueueItem } from "../services/queueService.js";
import { applyPlaybackEvent, buildSyncState } from "../services/syncService.js";

const chatBuckets = new Map();
const socketDebounce = new Map();
const CHAT_WINDOW_MS = 7000;
const CHAT_LIMIT = 6;
const VIDEO_DEBOUNCE_MS = 180;
const REACTION_LIST = ["😂", "❤️", "🔥", "😮", "👏", "😭", "👍", "👎", "🎉", "😍"];

function socketError(socket, event, error) {
  const message = error instanceof AppError || error?.isOperational ? error.message : "Realtime action failed.";
  socket.emit("socket-error", {
    event,
    message,
    details: error.details || null
  });
}

function ack(acknowledge, payload) {
  if (typeof acknowledge === "function") {
    acknowledge(payload);
  }
}

function isSpammy(socketId) {
  const now = Date.now();
  const bucket = chatBuckets.get(socketId) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < CHAT_WINDOW_MS);
  recent.push(now);
  chatBuckets.set(socketId, recent);
  return recent.length > CHAT_LIMIT;
}

function debounceEvent(socketId, eventName) {
  const key = `${socketId}:${eventName}`;
  const now = Date.now();
  const last = socketDebounce.get(key) || 0;
  socketDebounce.set(key, now);
  return now - last < VIDEO_DEBOUNCE_MS;
}

async function emitRoomUpdated(io, roomId) {
  const room = await Room.findOne({ roomId });
  if (!room) return;
  io.to(roomId).emit("room-updated", room.toObject({ versionKey: false }));
}

async function handleDisconnect(io, socket, reason = "left") {
  const previous = await disconnectMemberBySocket(socket.id);
  if (!previous?.user) return;

  socket.leave(previous.user.roomId);

  const systemMessage = await createSystemMessage(previous.user.roomId, `${previous.user.nickname} ${reason}.`);
  socket.to(previous.user.roomId).emit("chat-message", systemMessage);
  socket.to(previous.user.roomId).emit("member-left", {
    nickname: previous.user.nickname,
    reason
  });

  await emitRoomUpdated(io, previous.user.roomId);
}

async function handlePlayback(io, socket, eventName, payload = {}, acknowledge) {
  try {
    if (debounceEvent(socket.id, eventName)) return;

    const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
    const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
    const syncState = await applyPlaybackEvent(roomId, nickname, eventName, {
      ...payload,
      eventId: payload.eventId || `${eventName}:${socket.id}:${Date.now()}`
    });

    io.to(roomId).emit(eventName, syncState);
    io.to(roomId).emit("sync-state", syncState);
    ack(acknowledge, { success: true, data: syncState });
  } catch (error) {
    socketError(socket, eventName, error);
    ack(acknowledge, { success: false, message: error.message });
  }
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.emit("connection-status", {
      connected: true,
      socketId: socket.id
    });

    socket.on("join-room", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId);
        const nickname = normalizeNickname(payload.nickname);

        await verifyRoomAccess({ ...payload, roomId, nickname });
        const room = await connectMember(roomId, nickname, socket.id);

        socket.data.roomId = roomId;
        socket.data.nickname = nickname;
        socket.join(roomId);

        const systemMessage = await createSystemMessage(roomId, `${nickname} joined the room.`);

        socket.emit("sync-state", room.syncState);
        socket.emit("room-joined", { room, socketId: socket.id });
        socket.to(roomId).emit("member-joined", { nickname, room });
        io.to(roomId).emit("room-updated", room);
        io.to(roomId).emit("chat-message", systemMessage);

        ack(acknowledge, { success: true, data: { room, syncState: room.syncState } });
      } catch (error) {
        socketError(socket, "join-room", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("leave-room", async (_payload = {}, acknowledge) => {
      try {
        await handleDisconnect(io, socket, "left");
        ack(acknowledge, { success: true });
      } catch (error) {
        socketError(socket, "leave-room", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("chat-message", async (payload = {}, acknowledge) => {
      try {
        if (isSpammy(socket.id)) {
          throw new AppError("You are sending messages too quickly.", 429);
        }

        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
        const message = await createMessage({
          roomId,
          nickname,
          message: payload.message,
          type: "text"
        });

        io.to(roomId).emit("chat-message", message);
        ack(acknowledge, { success: true, data: message });
      } catch (error) {
        socketError(socket, "chat-message", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("typing-start", (payload = {}) => {
      const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
      const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
      socket.to(roomId).emit("typing-start", { nickname });
    });

    socket.on("typing-stop", (payload = {}) => {
      const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
      const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
      socket.to(roomId).emit("typing-stop", { nickname });
    });

    socket.on("reaction", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
        const room = await Room.findOne({ roomId });

        if (!room) throw new AppError("Room not found.", 404);
        if (!room.settings.reactionsEnabled) throw new AppError("Reactions are disabled by the host.", 403);

        const emoji = REACTION_LIST.includes(payload.emoji) ? payload.emoji : "🔥";
        const reaction = {
          id: payload.id || `${socket.id}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
          emoji,
          nickname,
          lane: Math.floor(Math.random() * 6),
          createdAt: new Date().toISOString()
        };

        io.to(roomId).emit("reaction", reaction);
        ack(acknowledge, { success: true, data: reaction });
      } catch (error) {
        socketError(socket, "reaction", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    ["video-play", "video-pause", "video-seek", "video-change", "speed-change", "volume-change"].forEach((eventName) => {
      socket.on(eventName, (payload = {}, acknowledge) => {
        handlePlayback(io, socket, eventName, payload, acknowledge);
      });
    });

    socket.on("queue-add", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const requestedBy = normalizeNickname(payload.requestedBy || payload.nickname || socket.data.nickname);
        const result = await addQueueItem(roomId, { ...payload, requestedBy });
        io.to(roomId).emit("queue-add", result.item);
        io.to(roomId).emit("queue-updated", result.queue);
        ack(acknowledge, { success: true, data: result });
      } catch (error) {
        socketError(socket, "queue-add", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("queue-remove", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const nickname = normalizeNickname(payload.nickname || socket.data.nickname);
        const result = await removeQueueItem(roomId, payload.itemId, nickname);
        io.to(roomId).emit("queue-remove", result.item);
        io.to(roomId).emit("queue-updated", result.queue);
        ack(acknowledge, { success: true, data: result });
      } catch (error) {
        socketError(socket, "queue-remove", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("queue-approve", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const hostNickname = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const result = await approveQueueItem(roomId, payload.itemId, hostNickname);
        io.to(roomId).emit("queue-updated", result.queue);
        ack(acknowledge, { success: true, data: result });
      } catch (error) {
        socketError(socket, "queue-approve", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("host-transfer", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const currentHost = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const room = await transferHost(roomId, currentHost, payload.nextHostNickname);

        io.to(roomId).emit("host-transfer", {
          nextHostNickname: payload.nextHostNickname,
          room
        });
        io.to(roomId).emit("room-updated", room);
        ack(acknowledge, { success: true, data: room });
      } catch (error) {
        socketError(socket, "host-transfer", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("member-kicked", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const hostNickname = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const result = await kickMember(roomId, hostNickname, payload.targetNickname);

        if (result.targetSocketId) {
          const targetSocket = io.sockets.sockets.get(result.targetSocketId);
          targetSocket?.emit("member-kicked", { roomId, targetNickname: result.targetNickname });
          targetSocket?.leave(roomId);
        }

        io.to(roomId).emit("room-updated", result.room);
        io.to(roomId).emit("chat-message", await createSystemMessage(roomId, `${result.targetNickname} was removed from the room.`));
        ack(acknowledge, { success: true, data: result.room });
      } catch (error) {
        socketError(socket, "member-kicked", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("room-locked", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const hostNickname = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const room = await updateRoomSettings(roomId, { hostNickname, locked: true });

        io.to(roomId).emit("room-locked", room);
        io.to(roomId).emit("room-updated", room);
        ack(acknowledge, { success: true, data: room });
      } catch (error) {
        socketError(socket, "room-locked", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("room-unlocked", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const hostNickname = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const room = await updateRoomSettings(roomId, { hostNickname, locked: false });

        io.to(roomId).emit("room-unlocked", room);
        io.to(roomId).emit("room-updated", room);
        ack(acknowledge, { success: true, data: room });
      } catch (error) {
        socketError(socket, "room-unlocked", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("room-settings-update", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const hostNickname = normalizeNickname(payload.hostNickname || socket.data.nickname);
        const room = await updateRoomSettings(roomId, { ...payload, hostNickname });

        io.to(roomId).emit("room-updated", room);
        ack(acknowledge, { success: true, data: room });
      } catch (error) {
        socketError(socket, "room-settings-update", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("sync-state", async (payload = {}, acknowledge) => {
      try {
        const roomId = normalizeRoomId(payload.roomId || socket.data.roomId);
        const room = await Room.findOne({ roomId });
        if (!room) throw new AppError("Room not found.", 404);
        const syncState = buildSyncState(room);

        socket.emit("sync-state", syncState);
        ack(acknowledge, { success: true, data: syncState });
      } catch (error) {
        socketError(socket, "sync-state", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("heartbeat", async (payload = {}, acknowledge) => {
      try {
        const roomId = payload.roomId || socket.data.roomId ? normalizeRoomId(payload.roomId || socket.data.roomId) : null;
        const room = roomId ? await Room.findOne({ roomId }) : null;
        const syncState = room ? buildSyncState(room) : null;

        socket.emit("heartbeat", {
          serverTime: Date.now(),
          syncState
        });
        ack(acknowledge, { success: true, data: { serverTime: Date.now(), syncState } });
      } catch (error) {
        socketError(socket, "heartbeat", error);
        ack(acknowledge, { success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      handleDisconnect(io, socket, "disconnected").catch((error) => {
        console.error("Disconnect handling failed", error);
      });
      chatBuckets.delete(socket.id);
    });
  });
}

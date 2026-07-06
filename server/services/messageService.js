import { Message } from "../models/Message.js";
import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";
import { normalizeNickname, normalizeRoomId, sanitizeText } from "../utils/sanitize.js";

export async function listMessages(roomIdInput, limit = 80) {
  const roomId = normalizeRoomId(roomIdInput);
  const messages = await Message.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 80, 150))
    .lean();

  return messages.reverse();
}

export async function createMessage({ roomId: roomIdInput, nickname: nicknameInput, message, type = "text" }) {
  const roomId = normalizeRoomId(roomIdInput);
  const nickname = normalizeNickname(nicknameInput);
  const cleanMessage = sanitizeText(message).slice(0, 500);

  if (!cleanMessage) {
    throw new AppError("Message cannot be empty.", 400);
  }

  const room = await Room.findOne({ roomId });
  if (!room) throw new AppError("Room not found.", 404);
  if (room.settings.chatMuted && type === "text" && room.host.nickname !== nickname) {
    throw new AppError("Chat is muted by the host.", 403);
  }

  return Message.create({
    roomId,
    nickname,
    message: cleanMessage,
    type
  });
}

export async function createSystemMessage(roomId, message) {
  return createMessage({
    roomId,
    nickname: "StreamSphere",
    message,
    type: "system"
  });
}

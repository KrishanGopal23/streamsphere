import bcrypt from "bcryptjs";
import { Room } from "../models/Room.js";
import { RoomSettings } from "../models/RoomSettings.js";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { Queue } from "../models/Queue.js";
import { AppError } from "../utils/AppError.js";
import { generateRoomId } from "../utils/roomId.js";
import { normalizeNickname, normalizeRoomId, sanitizeText } from "../utils/sanitize.js";
import { buildSyncState } from "./syncService.js";

function avatarFor(nickname) {
  const seed = encodeURIComponent(nickname || "Guest");
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=2563eb,7c3aed,14b8a6,f97316`;
}

function publicRoom(room) {
  const object = typeof room.toObject === "function" ? room.toObject({ versionKey: false }) : room;
  delete object.passwordHash;
  return {
    ...object,
    syncState: buildSyncState(object)
  };
}

async function createUniqueRoomId(preferredRoomId) {
  if (preferredRoomId) {
    const normalized = normalizeRoomId(preferredRoomId);
    const exists = await Room.exists({ roomId: normalized });
    if (exists) throw new AppError("That room ID is already taken.", 409);
    return normalized;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const roomId = generateRoomId();
    const exists = await Room.exists({ roomId });
    if (!exists) return roomId;
  }

  throw new AppError("Could not generate a unique room ID. Please try again.", 500);
}

export async function createRoom(payload) {
  const hostNickname = normalizeNickname(payload.hostNickname);
  const roomId = await createUniqueRoomId(payload.roomId);
  const passwordHash = payload.password ? await bcrypt.hash(payload.password, 12) : null;
  const settings = {
    visibility: payload.visibility || "private",
    allowEveryoneControls: Boolean(payload.allowEveryoneControls),
    chatMuted: false,
    reactionsEnabled: true,
    locked: false,
    autoplay: true
  };

  const room = await Room.create({
    roomId,
    name: sanitizeText(payload.name),
    passwordHash,
    host: {
      nickname: hostNickname,
      avatar: avatarFor(hostNickname)
    },
    members: [
      {
        nickname: hostNickname,
        avatar: avatarFor(hostNickname),
        isHost: true,
        connected: false,
        joinOrder: 1
      }
    ],
    settings
  });

  await RoomSettings.create({ roomId, ...settings });
  await User.create({
    nickname: hostNickname,
    roomId,
    avatar: avatarFor(hostNickname),
    isHost: true,
    connected: false,
    joinOrder: 1
  });
  await Message.create({
    roomId,
    nickname: "StreamSphere",
    message: `${hostNickname} created the room.`,
    type: "system"
  });

  return publicRoom(room);
}

export async function verifyRoomAccess(payload) {
  const roomId = normalizeRoomId(payload.roomId);
  const nickname = normalizeNickname(payload.nickname);
  const room = await Room.findOne({ roomId }).select("+passwordHash");

  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  if (room.settings.locked && room.host.nickname !== nickname) {
    throw new AppError("This room is locked by the host.", 423);
  }

  if (room.passwordHash) {
    const validPassword = await bcrypt.compare(payload.password || "", room.passwordHash);
    if (!validPassword) throw new AppError("Incorrect room password.", 401);
  }

  const existingMember = room.members.find((member) => member.nickname.toLowerCase() === nickname.toLowerCase());
  if (existingMember?.connected) {
    throw new AppError("That nickname is already active in this room.", 409);
  }

  return publicRoom(room);
}

export async function getRoomById(roomId) {
  const room = await Room.findOne({ roomId: normalizeRoomId(roomId) });
  if (!room) throw new AppError("Room not found.", 404);
  return publicRoom(room);
}

export async function updateRoomSettings(roomIdInput, payload) {
  const roomId = normalizeRoomId(roomIdInput);
  const hostNickname = normalizeNickname(payload.hostNickname);
  const room = await Room.findOne({ roomId }).select("+passwordHash");

  if (!room) throw new AppError("Room not found.", 404);
  if (room.host.nickname !== hostNickname) throw new AppError("Only the host can update room settings.", 403);

  const allowedSettings = ["visibility", "allowEveryoneControls", "chatMuted", "reactionsEnabled", "locked", "autoplay"];

  for (const key of allowedSettings) {
    if (payload[key] !== undefined) {
      room.settings[key] = payload[key];
    }
  }

  if (payload.password !== undefined) {
    room.passwordHash = payload.password ? await bcrypt.hash(payload.password, 12) : null;
  }

  await room.save();
  await RoomSettings.findOneAndUpdate({ roomId }, room.settings.toObject?.() || room.settings, {
    upsert: true,
    new: true
  });

  return publicRoom(room);
}

export async function deleteRoom(roomIdInput, hostNicknameInput) {
  const roomId = normalizeRoomId(roomIdInput);
  const hostNickname = normalizeNickname(hostNicknameInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);
  if (room.host.nickname !== hostNickname) throw new AppError("Only the host can delete the room.", 403);

  await Promise.all([
    Room.deleteOne({ roomId }),
    RoomSettings.deleteOne({ roomId }),
    User.deleteMany({ roomId }),
    Message.deleteMany({ roomId }),
    Queue.deleteMany({ roomId })
  ]);

  return { roomId };
}

export async function connectMember(roomIdInput, nicknameInput, socketId) {
  const roomId = normalizeRoomId(roomIdInput);
  const nickname = normalizeNickname(nicknameInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);

  const now = new Date();
  let member = room.members.find((item) => item.nickname.toLowerCase() === nickname.toLowerCase());
  const nextJoinOrder = room.members.length ? Math.max(...room.members.map((item) => item.joinOrder || 0)) + 1 : 1;

  if (!member) {
    member = {
      nickname,
      avatar: avatarFor(nickname),
      isHost: room.host.nickname === nickname,
      connected: true,
      socketId,
      joinOrder: nextJoinOrder,
      joinedAt: now,
      lastSeenAt: now
    };
    room.members.push(member);
  } else {
    member.socketId = socketId;
    member.connected = true;
    member.lastSeenAt = now;
    member.isHost = room.host.nickname === nickname;
  }

  if (room.host.nickname === nickname) {
    room.host.socketId = socketId;
  }

  await room.save();

  await User.findOneAndUpdate(
    { roomId, nickname },
    {
      roomId,
      nickname,
      socketId,
      avatar: member.avatar,
      isHost: member.isHost,
      connected: true,
      joinOrder: member.joinOrder,
      lastSeenAt: now
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return publicRoom(room);
}

export async function disconnectMemberBySocket(socketId) {
  const user = await User.findOne({ socketId });
  if (!user) return null;

  const now = new Date();
  user.connected = false;
  user.socketId = null;
  user.lastSeenAt = now;
  await user.save();

  const room = await Room.findOne({ roomId: user.roomId });
  if (!room) return { user, room: null };

  const member = room.members.find((item) => item.nickname === user.nickname);
  if (member) {
    member.connected = false;
    member.socketId = null;
    member.lastSeenAt = now;
  }

  if (room.host.nickname === user.nickname) {
    room.host.socketId = null;
  }

  await room.save();
  return { user, room: publicRoom(room) };
}

export async function transferHost(roomIdInput, currentHostInput, nextHostInput) {
  const roomId = normalizeRoomId(roomIdInput);
  const currentHost = normalizeNickname(currentHostInput);
  const nextHost = normalizeNickname(nextHostInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);
  if (room.host.nickname !== currentHost) throw new AppError("Only the host can transfer host controls.", 403);

  const nextMember = room.members.find((member) => member.nickname === nextHost);
  if (!nextMember) throw new AppError("Target member is not in the room.", 404);

  room.members.forEach((member) => {
    member.isHost = member.nickname === nextHost;
  });
  room.host = {
    nickname: nextMember.nickname,
    socketId: nextMember.socketId,
    avatar: nextMember.avatar
  };

  await room.save();
  await User.updateMany({ roomId }, { isHost: false });
  await User.updateOne({ roomId, nickname: nextHost }, { isHost: true });

  return publicRoom(room);
}

export async function kickMember(roomIdInput, hostNicknameInput, targetNicknameInput) {
  const roomId = normalizeRoomId(roomIdInput);
  const hostNickname = normalizeNickname(hostNicknameInput);
  const targetNickname = normalizeNickname(targetNicknameInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);
  if (room.host.nickname !== hostNickname) throw new AppError("Only the host can kick members.", 403);
  if (room.host.nickname === targetNickname) throw new AppError("The host cannot kick themselves.", 400);

  const targetMember = room.members.find((member) => member.nickname === targetNickname);
  if (!targetMember) throw new AppError("Member not found.", 404);

  room.members = room.members.filter((member) => member.nickname !== targetNickname);
  await room.save();
  await User.deleteOne({ roomId, nickname: targetNickname });

  return {
    room: publicRoom(room),
    targetSocketId: targetMember.socketId,
    targetNickname
  };
}

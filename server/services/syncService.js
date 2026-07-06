import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";

const MIN_SPEED = 0.25;
const MAX_SPEED = 2;

export function clampTime(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function clampSpeed(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, number));
}

export function clampVolume(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 70;
  return Math.min(100, Math.max(0, number));
}

export function getProjectedTime(room, at = Date.now()) {
  const baseTime = clampTime(room.currentTime);
  if (!room.isPlaying) return baseTime;

  const lastSyncAt = room.lastSyncAt ? new Date(room.lastSyncAt).getTime() : at;
  const elapsedSeconds = Math.max(0, (at - lastSyncAt) / 1000);

  return baseTime + elapsedSeconds * clampSpeed(room.playbackSpeed);
}

export function buildSyncState(room, extra = {}) {
  const serverTime = Date.now();

  return {
    roomId: room.roomId,
    currentVideo: room.currentVideo,
    currentTime: getProjectedTime(room, serverTime),
    isPlaying: room.isPlaying,
    playbackSpeed: room.playbackSpeed,
    volume: room.volume,
    lastSyncAt: room.lastSyncAt,
    serverTime,
    eventId: extra.eventId || `${room.roomId}:${serverTime}`,
    initiatedBy: extra.initiatedBy || null
  };
}

export function canControlRoom(room, nickname) {
  if (!room) return false;
  if (room.host?.nickname === nickname) return true;
  return Boolean(room.settings?.allowEveryoneControls);
}

export async function ensureCanControl(roomId, nickname) {
  const room = await Room.findOne({ roomId });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (!canControlRoom(room, nickname)) {
    throw new AppError("Only the host can control playback in this room.", 403);
  }

  return room;
}

export async function applyPlaybackEvent(roomId, nickname, type, payload = {}) {
  const room = await ensureCanControl(roomId, nickname);
  const now = new Date();
  const projectedTime = getProjectedTime(room, now.getTime());
  const incomingTime = payload.currentTime ?? payload.time;
  const nextTime = Number.isFinite(Number(incomingTime)) ? clampTime(incomingTime) : projectedTime;

  if (type === "video-play") {
    room.currentTime = nextTime;
    room.isPlaying = true;
  }

  if (type === "video-pause") {
    room.currentTime = nextTime;
    room.isPlaying = false;
  }

  if (type === "video-seek") {
    room.currentTime = nextTime;
  }

  if (type === "speed-change") {
    room.currentTime = nextTime;
    room.playbackSpeed = clampSpeed(payload.playbackSpeed ?? payload.speed);
  }

  if (type === "volume-change") {
    room.volume = clampVolume(payload.volume);
  }

  if (type === "video-change") {
    room.currentVideo = {
      videoId: payload.videoId,
      title: payload.title || "Untitled video",
      channel: payload.channel || "YouTube",
      thumbnail: payload.thumbnail || `https://i.ytimg.com/vi/${payload.videoId}/hqdefault.jpg`,
      duration: payload.duration || ""
    };
    room.currentTime = 0;
    room.isPlaying = Boolean(room.settings?.autoplay);
  }

  room.lastSyncAt = now;
  await room.save();

  return buildSyncState(room, {
    eventId: payload.eventId,
    initiatedBy: nickname
  });
}

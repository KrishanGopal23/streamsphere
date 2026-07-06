import { Queue } from "../models/Queue.js";
import { Room } from "../models/Room.js";
import { AppError } from "../utils/AppError.js";
import { normalizeNickname, normalizeRoomId, sanitizeText } from "../utils/sanitize.js";

async function updateRoomQueueSnapshot(roomId) {
  const queue = await Queue.find({ roomId, status: { $in: ["suggested", "approved"] } })
    .sort({ status: 1, position: 1, createdAt: 1 })
    .lean();

  await Room.updateOne(
    { roomId },
    {
      $set: {
        queue: queue.map((item) => ({
          queueItemId: item._id,
          videoId: item.videoId,
          title: item.title,
          thumbnail: item.thumbnail,
          requestedBy: item.requestedBy,
          duration: item.duration,
          status: item.status,
          position: item.position
        }))
      }
    }
  );

  return queue;
}

export async function listQueue(roomIdInput) {
  return Queue.find({ roomId: normalizeRoomId(roomIdInput), status: { $in: ["suggested", "approved"] } })
    .sort({ status: 1, position: 1, createdAt: 1 })
    .lean();
}

export async function addQueueItem(roomIdInput, payload) {
  const roomId = normalizeRoomId(roomIdInput);
  const requestedBy = normalizeNickname(payload.requestedBy);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);

  const position = await Queue.countDocuments({ roomId });
  const status = room.host.nickname === requestedBy ? "approved" : "suggested";
  const item = await Queue.create({
    roomId,
    videoId: sanitizeText(payload.videoId),
    title: sanitizeText(payload.title).slice(0, 180),
    thumbnail: payload.thumbnail || `https://i.ytimg.com/vi/${payload.videoId}/hqdefault.jpg`,
    duration: sanitizeText(payload.duration || ""),
    requestedBy,
    status,
    position
  });

  const queue = await updateRoomQueueSnapshot(roomId);

  return { item, queue };
}

export async function approveQueueItem(roomIdInput, itemId, hostNicknameInput) {
  const roomId = normalizeRoomId(roomIdInput);
  const hostNickname = normalizeNickname(hostNicknameInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);
  if (room.host.nickname !== hostNickname) throw new AppError("Only the host can approve queue items.", 403);

  const item = await Queue.findOneAndUpdate(
    { _id: itemId, roomId },
    { status: "approved", approvedBy: hostNickname },
    { new: true }
  );

  if (!item) throw new AppError("Queue item not found.", 404);

  const queue = await updateRoomQueueSnapshot(roomId);
  return { item, queue };
}

export async function removeQueueItem(roomIdInput, itemId, nicknameInput) {
  const roomId = normalizeRoomId(roomIdInput);
  const nickname = normalizeNickname(nicknameInput);
  const room = await Room.findOne({ roomId });

  if (!room) throw new AppError("Room not found.", 404);

  const item = await Queue.findOne({ _id: itemId, roomId });
  if (!item) throw new AppError("Queue item not found.", 404);

  const isAllowed = room.host.nickname === nickname || item.requestedBy === nickname;
  if (!isAllowed) throw new AppError("Only the host or requester can remove this item.", 403);

  await Queue.deleteOne({ _id: itemId, roomId });
  const queue = await updateRoomQueueSnapshot(roomId);

  return { item, queue };
}

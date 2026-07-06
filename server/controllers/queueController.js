import {
  addQueueItem,
  approveQueueItem,
  listQueue,
  removeQueueItem
} from "../services/queueService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const listQueueController = asyncHandler(async (req, res) => {
  const queue = await listQueue(req.params.roomId);
  sendSuccess(res, queue, "Queue loaded");
});

export const addQueueController = asyncHandler(async (req, res) => {
  const result = await addQueueItem(req.params.roomId, req.body);
  sendSuccess(res, result, "Queue item added", 201);
});

export const approveQueueController = asyncHandler(async (req, res) => {
  const result = await approveQueueItem(req.params.roomId, req.params.itemId, req.body.hostNickname);
  sendSuccess(res, result, "Queue item approved");
});

export const removeQueueController = asyncHandler(async (req, res) => {
  const result = await removeQueueItem(req.params.roomId, req.params.itemId, req.body.hostNickname || req.query.nickname);
  sendSuccess(res, result, "Queue item removed");
});

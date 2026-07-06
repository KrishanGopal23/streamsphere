import { listMessages } from "../services/messageService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const listMessagesController = asyncHandler(async (req, res) => {
  const messages = await listMessages(req.params.roomId, req.query.limit);
  sendSuccess(res, messages, "Messages loaded");
});

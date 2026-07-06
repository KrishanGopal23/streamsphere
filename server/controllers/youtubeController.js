import { searchYouTube } from "../services/youtubeService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const searchYouTubeController = asyncHandler(async (req, res) => {
  const results = await searchYouTube(req.query.q);
  sendSuccess(res, results, "YouTube results loaded");
});

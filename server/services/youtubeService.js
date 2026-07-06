import axios from "axios";
import env from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { sanitizeText } from "../utils/sanitize.js";

function parseIsoDuration(duration = "") {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  const parts = hours ? [hours, String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")] : [minutes, String(seconds).padStart(2, "0")];

  return parts.join(":");
}

function formatViews(count) {
  const number = Number(count || 0);
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
}

export async function searchYouTube(query) {
  if (!env.youtubeApiKey) {
    throw new AppError("YouTube API key is not configured on the server.", 503);
  }

  const searchResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
    params: {
      key: env.youtubeApiKey,
      q: sanitizeText(query),
      part: "snippet",
      type: "video",
      maxResults: 10,
      safeSearch: "moderate"
    },
    timeout: 8000
  });

  const videoIds = searchResponse.data.items.map((item) => item.id.videoId).filter(Boolean);
  if (!videoIds.length) return [];

  const detailsResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
    params: {
      key: env.youtubeApiKey,
      id: videoIds.join(","),
      part: "snippet,contentDetails,statistics"
    },
    timeout: 8000
  });

  return detailsResponse.data.items.map((item) => ({
    videoId: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
    duration: parseIsoDuration(item.contentDetails?.duration),
    views: formatViews(item.statistics?.viewCount),
    publishedAt: item.snippet.publishedAt
  }));
}

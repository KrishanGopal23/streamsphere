import { api, unwrap } from "./http.js";

export const youtubeApi = {
  search(query) {
    return api.get("/youtube/search", { params: { q: query } }).then(unwrap);
  }
};

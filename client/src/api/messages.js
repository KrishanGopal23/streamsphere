import { api, unwrap } from "./http.js";

export const messagesApi = {
  list(roomId) {
    return api.get(`/messages/${roomId}`, { silent: true }).then(unwrap);
  }
};

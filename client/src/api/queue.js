import { api, unwrap } from "./http.js";

export const queueApi = {
  list(roomId) {
    return api.get(`/queue/${roomId}`, { silent: true }).then(unwrap);
  },
  add(roomId, payload) {
    return api.post(`/queue/${roomId}`, payload).then(unwrap);
  },
  approve(roomId, itemId, hostNickname) {
    return api.patch(`/queue/${roomId}/${itemId}/approve`, { hostNickname }).then(unwrap);
  },
  remove(roomId, itemId, nickname) {
    return api.delete(`/queue/${roomId}/${itemId}`, { data: { hostNickname: nickname } }).then(unwrap);
  }
};

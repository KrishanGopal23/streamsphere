import { api, unwrap } from "./http.js";

export const roomsApi = {
  create(payload) {
    return api.post("/rooms", payload).then(unwrap);
  },
  join(payload) {
    return api.post("/rooms/join", payload).then(unwrap);
  },
  get(roomId) {
    return api.get(`/rooms/${roomId}`, { silent: true }).then(unwrap);
  },
  updateSettings(roomId, payload) {
    return api.patch(`/rooms/${roomId}/settings`, payload).then(unwrap);
  },
  delete(roomId, hostNickname) {
    return api.delete(`/rooms/${roomId}`, { data: { hostNickname } }).then(unwrap);
  }
};

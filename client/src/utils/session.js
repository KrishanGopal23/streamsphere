import { SESSION_KEY } from "./constants.js";

export function getSession(roomId) {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    return data[roomId] || null;
  } catch {
    return null;
  }
}

export function saveSession(roomId, session) {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
    data[roomId] = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    // Local storage can be disabled in hardened browsers. Joining still works for this page load.
  }
}

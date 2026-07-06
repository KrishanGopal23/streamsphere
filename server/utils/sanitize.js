export function sanitizeText(value = "") {
  return String(value)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeNickname(value = "") {
  return sanitizeText(value).slice(0, 32);
}

export function normalizeRoomId(value = "") {
  return String(value).trim().toUpperCase();
}

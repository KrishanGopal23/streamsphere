import { customAlphabet } from "nanoid";

const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8);

export function generateRoomId() {
  return nanoid();
}

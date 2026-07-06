import jwt from "jsonwebtoken";
import env from "../config/env.js";

export function signReservedToken(payload, options = {}) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
    ...options
  });
}

export function verifyReservedToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

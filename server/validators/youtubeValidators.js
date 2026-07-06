import { query } from "express-validator";

export const youtubeSearchValidator = [
  query("q").trim().isLength({ min: 2, max: 120 }).withMessage("Search query must be 2 to 120 characters.")
];

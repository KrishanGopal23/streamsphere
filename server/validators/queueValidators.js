import { body, param } from "express-validator";

export const queueRoomParamValidator = [param("roomId").trim().isLength({ min: 4, max: 16 })];

export const addQueueValidator = [
  param("roomId").trim().isLength({ min: 4, max: 16 }),
  body("videoId").trim().isLength({ min: 6, max: 32 }),
  body("title").trim().isLength({ min: 1, max: 180 }),
  body("thumbnail").optional({ checkFalsy: true }).isURL(),
  body("requestedBy").trim().isLength({ min: 2, max: 32 }),
  body("duration").optional({ checkFalsy: true }).isLength({ max: 24 })
];

export const queueItemValidator = [
  param("roomId").trim().isLength({ min: 4, max: 16 }),
  param("itemId").isMongoId(),
  body("hostNickname").optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 32 })
];

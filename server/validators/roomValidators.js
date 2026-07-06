import { body, param } from "express-validator";

export const createRoomValidator = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Room name must be 2 to 80 characters."),
  body("roomId")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[A-Za-z0-9_-]{4,16}$/)
    .withMessage("Room ID must be 4 to 16 letters, numbers, underscores, or hyphens."),
  body("password").optional({ checkFalsy: true }).isLength({ min: 4, max: 80 }),
  body("hostNickname").trim().isLength({ min: 2, max: 32 }),
  body("visibility").optional().isIn(["public", "private"]),
  body("allowEveryoneControls").optional().isBoolean().toBoolean()
];

export const joinRoomValidator = [
  body("roomId").trim().isLength({ min: 4, max: 16 }),
  body("password").optional({ checkFalsy: true }).isLength({ max: 80 }),
  body("nickname").trim().isLength({ min: 2, max: 32 })
];

export const roomIdParamValidator = [param("roomId").trim().isLength({ min: 4, max: 16 })];

export const settingsValidator = [
  param("roomId").trim().isLength({ min: 4, max: 16 }),
  body("hostNickname").trim().isLength({ min: 2, max: 32 }),
  body("password").optional({ checkFalsy: true }).isLength({ min: 4, max: 80 }),
  body("visibility").optional().isIn(["public", "private"]),
  body("allowEveryoneControls").optional().isBoolean().toBoolean(),
  body("chatMuted").optional().isBoolean().toBoolean(),
  body("reactionsEnabled").optional().isBoolean().toBoolean(),
  body("locked").optional().isBoolean().toBoolean(),
  body("autoplay").optional().isBoolean().toBoolean()
];

export const deleteRoomValidator = [
  param("roomId").trim().isLength({ min: 4, max: 16 }),
  body("hostNickname").trim().isLength({ min: 2, max: 32 })
];

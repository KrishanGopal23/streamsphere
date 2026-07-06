import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createRoom,
  deleteRoom,
  getRoomById,
  updateRoomSettings,
  verifyRoomAccess
} from "../services/roomService.js";

export const createRoomController = asyncHandler(async (req, res) => {
  const room = await createRoom(req.body);
  sendSuccess(res, room, "Room created", 201);
});

export const joinRoomController = asyncHandler(async (req, res) => {
  const room = await verifyRoomAccess(req.body);
  sendSuccess(res, room, "Room access granted");
});

export const getRoomController = asyncHandler(async (req, res) => {
  const room = await getRoomById(req.params.roomId);
  sendSuccess(res, room, "Room loaded");
});

export const updateRoomSettingsController = asyncHandler(async (req, res) => {
  const room = await updateRoomSettings(req.params.roomId, req.body);
  sendSuccess(res, room, "Room settings updated");
});

export const deleteRoomController = asyncHandler(async (req, res) => {
  const room = await deleteRoom(req.params.roomId, req.body.hostNickname);
  sendSuccess(res, room, "Room deleted");
});

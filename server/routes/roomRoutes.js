import { Router } from "express";
import {
  createRoomController,
  deleteRoomController,
  getRoomController,
  joinRoomController,
  updateRoomSettingsController
} from "../controllers/roomController.js";
import { validateRequest } from "../middleware/validate.js";
import {
  createRoomValidator,
  deleteRoomValidator,
  joinRoomValidator,
  roomIdParamValidator,
  settingsValidator
} from "../validators/roomValidators.js";

const router = Router();

router.post("/", createRoomValidator, validateRequest, createRoomController);
router.post("/join", joinRoomValidator, validateRequest, joinRoomController);
router.get("/:roomId", roomIdParamValidator, validateRequest, getRoomController);
router.patch("/:roomId/settings", settingsValidator, validateRequest, updateRoomSettingsController);
router.delete("/:roomId", deleteRoomValidator, validateRequest, deleteRoomController);

export default router;

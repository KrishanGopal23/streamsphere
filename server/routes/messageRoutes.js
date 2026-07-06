import { Router } from "express";
import { listMessagesController } from "../controllers/messageController.js";
import { validateRequest } from "../middleware/validate.js";
import { roomIdParamValidator } from "../validators/roomValidators.js";

const router = Router();

router.get("/:roomId", roomIdParamValidator, validateRequest, listMessagesController);

export default router;

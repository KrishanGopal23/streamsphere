import { Router } from "express";
import {
  addQueueController,
  approveQueueController,
  listQueueController,
  removeQueueController
} from "../controllers/queueController.js";
import { validateRequest } from "../middleware/validate.js";
import {
  addQueueValidator,
  queueItemValidator,
  queueRoomParamValidator
} from "../validators/queueValidators.js";

const router = Router();

router.get("/:roomId", queueRoomParamValidator, validateRequest, listQueueController);
router.post("/:roomId", addQueueValidator, validateRequest, addQueueController);
router.patch("/:roomId/:itemId/approve", queueItemValidator, validateRequest, approveQueueController);
router.delete("/:roomId/:itemId", queueItemValidator, validateRequest, removeQueueController);

export default router;

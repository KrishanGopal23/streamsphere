import { Router } from "express";
import { searchYouTubeController } from "../controllers/youtubeController.js";
import { validateRequest } from "../middleware/validate.js";
import { youtubeSearchValidator } from "../validators/youtubeValidators.js";

const router = Router();

router.get("/search", youtubeSearchValidator, validateRequest, searchYouTubeController);

export default router;

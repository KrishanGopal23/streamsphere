import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import messageRoutes from "./messageRoutes.js";
import queueRoutes from "./queueRoutes.js";
import roomRoutes from "./roomRoutes.js";
import youtubeRoutes from "./youtubeRoutes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/rooms", roomRoutes);
router.use("/messages", messageRoutes);
router.use("/queue", queueRoutes);
router.use("/youtube", youtubeRoutes);

export default router;

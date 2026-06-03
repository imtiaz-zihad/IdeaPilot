import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getHistory,
  postMessage,
  clearHistory,
} from "../controllers/chat.controller";

const router = Router();

// GET    /api/chat/:startupId  — load history
// POST   /api/chat/:startupId  — send message + get AI reply
// DELETE /api/chat/:startupId  — clear history
router.get   ("/:startupId", protect, getHistory);
router.post  ("/:startupId", protect, postMessage);
router.delete("/:startupId", protect, clearHistory);

export default router;
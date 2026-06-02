import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getMarketResearch,
  regenerateMarketResearch,
} from "../controllers/market.controller";

const router = Router();

// POST /api/startups/:startupId/market          → get or generate (cached)
// POST /api/startups/:startupId/market/regenerate → force new generation
router.post("/:startupId/market",             protect, getMarketResearch);
router.post("/:startupId/market/regenerate",  protect, regenerateMarketResearch);

export default router;
import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { getPitchDeck, regeneratePitchDeck } from "../controllers/pitchdeck.controller";

const router = Router();

router.post("/:startupId/pitch",             protect, getPitchDeck);
router.post("/:startupId/pitch/regenerate",  protect, regeneratePitchDeck);

export default router;
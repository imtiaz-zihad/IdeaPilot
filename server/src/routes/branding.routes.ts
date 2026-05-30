import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { getBranding, regenerateBranding } from "../controllers/branding.controller";

const router = Router();

router.post("/:startupId/branding",     protect, getBranding);
router.post("/:startupId/branding/regenerate", protect, regenerateBranding);

export default router;
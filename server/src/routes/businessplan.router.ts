import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getBusinessPlan,
  regenerateBusinessPlan,
} from "../controllers/businessplan.controller";

const router = Router();

router.post("/:startupId/business-plan",            protect, getBusinessPlan);
router.post("/:startupId/business-plan/regenerate", protect, regenerateBusinessPlan);

export default router;
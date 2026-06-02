import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  getFinancialForecast,
  regenerateFinancialForecast,
} from "../controllers/financial.controller";

const router = Router();

router.post("/:startupId/financial",            protect, getFinancialForecast);
router.post("/:startupId/financial/regenerate", protect, regenerateFinancialForecast);

export default router;

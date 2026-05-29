import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { validateIdea, revalidateIdea } from "../controllers/validator.controller";

const router = Router();

router.post("/:startupId/validate",   protect, validateIdea);
router.post("/:startupId/revalidate", protect, revalidateIdea);

export default router;
import { Router } from "express";
import { protect, AuthRequest } from "../middlewares/auth.middleware";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { z } from "zod";
import { Response } from "express";

const router = Router();

const startupSchema = z.object({
  startupName:    z.string().min(2),
  idea:           z.string().min(10),
  industry:       z.string().min(2),
  targetAudience: z.string().min(2),
  country:        z.string().min(2),
});

// Create startup
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const body = startupSchema.parse(req.body);
    const startup = await Startup.create({ ...body, userId: req.userId });
    sendSuccess(res, startup, "Startup created", 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    sendError(res, msg, 400);
  }
});

// Get all startups for user
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  const startups = await Startup.find({ userId: req.userId }).sort({ createdAt: -1 });
  sendSuccess(res, startups);
});

// Get single startup
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  const startup = await Startup.findOne({ _id: req.params.id, userId: req.userId });
  if (!startup) return sendError(res, "Not found", 404);
  sendSuccess(res, startup);
});

export default router;
import { Router } from "express";
import { protect, AuthRequest } from "../middlewares/auth.middleware";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { z } from "zod";
import { Response } from "express";
import { AIReport } from "../models/aiReport.model";

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

// Get single startup + its AI reports
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const reports = await AIReport.find({ startupId: startup._id })
      .sort({ createdAt: -1 })
      .select("type result createdAt");

    sendSuccess(res, { startup, reports });
  } catch {
    sendError(res, "Failed to fetch startup", 500);
  }
});

// Update stage
router.patch("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { stage } = z.object({
      stage: z.enum(["idea", "mvp", "growth", "scale"]),
    }).parse(req.body);

    const startup = await Startup.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { stage },
      { new: true }
    );

    if (!startup) return sendError(res, "Startup not found", 404);
    sendSuccess(res, startup, "Stage updated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    sendError(res, msg, 400);
  }
});

// Delete startup + all its reports
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    await AIReport.deleteMany({ startupId: req.params.id });
    sendSuccess(res, null, "Startup deleted");
  } catch {
    sendError(res, "Failed to delete startup", 500);
  }
});

export default router;
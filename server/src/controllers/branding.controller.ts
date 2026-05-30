import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateBranding } from "../services/branding.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getBranding = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    // Return cached
    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "branding",
    });
    if (existing) {
      return sendSuccess(res, { report: existing, cached: true });
    }

    const result = await generateBranding({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
    });

    const report = await AIReport.create({
      startupId: startup._id,
      userId: req.userId,
      type: "branding",
      result: result as any,
    });

    sendSuccess(res, { report, cached: false }, "Branding generated");
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Branding generation failed";
    sendError(res, msg, 500);
  }
};

export const regenerateBranding = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await generateBranding({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
    });

    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "branding" },
      { result, userId: req.userId },
      { upsert: true, new: true },
    );

    sendSuccess(res, { report, cached: false }, "Branding regenerated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    sendError(res, msg, 500);
  }
};

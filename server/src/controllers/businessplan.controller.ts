import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateBusinessPlan } from "../services/businessplan.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getBusinessPlan = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    // Return cached
    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "business_plan",
    });
    if (existing) {
      return sendSuccess(
        res,
        { report: existing, cached: true },
        "Business plan retrieved",
      );
    }

    const result = await generateBusinessPlan({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
      investorScore: startup.investorScore,
    });

    const report = await AIReport.create({
      startupId: startup._id,
      userId: req.userId,
      type: "business_plan",
      result: { ...result },
    });

    sendSuccess(res, { report, cached: false }, "Business plan generated");
  } catch (err: unknown) {
    console.error("Business plan error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    sendError(res, msg, 500);
  }
};

export const regenerateBusinessPlan = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await generateBusinessPlan({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
      investorScore: startup.investorScore,
    });

    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "business_plan" },
      { result, userId: req.userId },
      { upsert: true, new: true },
    );

    sendSuccess(res, { report, cached: false }, "Business plan regenerated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Regeneration failed";
    sendError(res, msg, 500);
  }
};

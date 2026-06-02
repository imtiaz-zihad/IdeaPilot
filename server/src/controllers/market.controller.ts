import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateMarketResearch } from "../services/market.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

// GET or generate (cached)
export const getMarketResearch = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    // Return cached report if exists
    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "market_research",
    });
    if (existing) {
      return sendSuccess(
        res,
        { report: existing, cached: true },
        "Market research retrieved",
      );
    }

    // Generate new
    const result = await generateMarketResearch({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
    });

    const report = await AIReport.create({
      startupId: startup._id,
      userId: req.userId,
      type: "market_research",
      result: result as any,
    });

    sendSuccess(res, { report, cached: false }, "Market research generated");
  } catch (err: unknown) {
    console.error("Market research error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    sendError(res, msg, 500);
  }
};

// Force regenerate (ignore cache)
export const regenerateMarketResearch = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await generateMarketResearch({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
    });

    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "market_research" },
      { result, userId: req.userId },
      { upsert: true, new: true },
    );

    sendSuccess(res, { report, cached: false }, "Market research regenerated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Regeneration failed";
    sendError(res, msg, 500);
  }
};

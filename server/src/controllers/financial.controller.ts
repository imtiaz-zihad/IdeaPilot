import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generateFinancialForecast } from "../services/financial.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getFinancialForecast = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    // Return cached
    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "financial",
    });
    if (existing) {
      return sendSuccess(
        res,
        { report: existing, cached: true },
        "Financial forecast retrieved",
      );
    }

    const result = await generateFinancialForecast({
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
      type: "financial",
      result: result as any,
    });

    sendSuccess(res, { report, cached: false }, "Financial forecast generated");
  } catch (err: unknown) {
    console.error("Financial forecast error:", err);
    const msg = err instanceof Error ? err.message : "Generation failed";
    sendError(res, msg, 500);
  }
};

export const regenerateFinancialForecast = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await generateFinancialForecast({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
      investorScore: startup.investorScore,
    });

    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "financial" },
      { result, userId: req.userId },
      { upsert: true, new: true },
    );

    sendSuccess(
      res,
      { report, cached: false },
      "Financial forecast regenerated",
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Regeneration failed";
    sendError(res, msg, 500);
  }
};

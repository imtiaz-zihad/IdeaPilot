import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { generatePitchDeck } from "../services/pitchdeck.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getPitchDeck = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "pitch",
    });
    if (existing) {
      return sendSuccess(res, { report: existing, cached: true });
    }

    const result = await generatePitchDeck({
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
      type: "pitch",
      result: result as unknown as Record<string, unknown>,
    });

    sendSuccess(res, { report, cached: false }, "Pitch deck generated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Generation failed";
    sendError(res, msg, 500);
  }
};

export const regeneratePitchDeck = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });
    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await generatePitchDeck({
      startupName: startup.startupName,
      idea: startup.idea,
      industry: startup.industry,
      targetAudience: startup.targetAudience,
      country: startup.country,
      investorScore: startup.investorScore,
    });

    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "pitch" },
      {
        result: result as unknown as Record<string, unknown>,
        userId: req.userId,
      },
      { upsert: true, new: true },
    );

    sendSuccess(res, { report, cached: false }, "Pitch deck regenerated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed";
    sendError(res, msg, 500);
  }
};

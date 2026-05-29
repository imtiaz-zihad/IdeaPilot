import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateStartupIdea } from "../services/validator.service";
import { AIReport } from "../models/aiReport.model";
import { Startup } from "../models/startup.model";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const validateIdea = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });

    if (!startup) return sendError(res, "Startup not found", 404);

    // Check if report already exists — return cached version
    const existing = await AIReport.findOne({
      startupId: startup._id,
      type: "validation",
    });

    if (existing) {
      return sendSuccess(res, { report: existing, cached: true }, "Validation report retrieved");
    }

    // Generate new report
    const result = await validateStartupIdea({
      startupName:    startup.startupName,
      idea:           startup.idea,
      industry:       startup.industry,
      targetAudience: startup.targetAudience,
      country:        startup.country,
    });

    // Save to DB
    const report = await AIReport.create({
      startupId: startup._id,
      userId:    req.userId,
      type:      "validation",
      result,
    });

    // Update investor score on startup
    await Startup.findByIdAndUpdate(startup._id, {
      investorScore: result.overallScore,
    });

    sendSuccess(res, { report, cached: false }, "Idea validated successfully");
  } catch (err: unknown) {
    console.error("Validator error:", err);
    const msg = err instanceof Error ? err.message : "Validation failed";
    sendError(res, msg, 500);
  }
};

// Force regenerate (ignore cache)
export const revalidateIdea = async (req: AuthRequest, res: Response) => {
  try {
    const startup = await Startup.findOne({
      _id: req.params.startupId,
      userId: req.userId,
    });

    if (!startup) return sendError(res, "Startup not found", 404);

    const result = await validateStartupIdea({
      startupName:    startup.startupName,
      idea:           startup.idea,
      industry:       startup.industry,
      targetAudience: startup.targetAudience,
      country:        startup.country,
    });

    // Upsert
    const report = await AIReport.findOneAndUpdate(
      { startupId: startup._id, type: "validation" },
      { result, userId: req.userId },
      { upsert: true, new: true }
    );

    await Startup.findByIdAndUpdate(startup._id, {
      investorScore: result.overallScore,
    });

    sendSuccess(res, { report, cached: false }, "Idea re-validated successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Revalidation failed";
    sendError(res, msg, 500);
  }
};
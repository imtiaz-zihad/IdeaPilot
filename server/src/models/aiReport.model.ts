import mongoose, { Document, Schema } from "mongoose";

export interface IValidationReport {
  overallScore: number;
  demand: { score: number; label: string; summary: string };
  competition: { score: number; label: string; summary: string };
  monetization: { score: number; label: string; summary: string };
  scalability: { score: number; label: string; summary: string };
  risk: { score: number; label: string; summary: string };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendation: string;
}

export interface IAIReport extends Document {
  startupId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: "validation" | "business_plan" | "market_research" | "financial" | "pitch" | "branding";
  result: IValidationReport | Record<string, unknown>;
  rawPrompt: string;
  createdAt: Date;
}

const aiReportSchema = new Schema<IAIReport>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: "Startup", required: true },
    userId:    { type: Schema.Types.ObjectId, ref: "User",    required: true },
    type: {
      type: String,
      enum: ["validation", "business_plan", "market_research", "financial", "pitch", "branding"],
      required: true,
    },
    result:    { type: Schema.Types.Mixed, required: true },
    rawPrompt: { type: String },
  },
  { timestamps: true }
);

aiReportSchema.index({ startupId: 1, type: 1 });

export const AIReport = mongoose.model<IAIReport>("AIReport", aiReportSchema);
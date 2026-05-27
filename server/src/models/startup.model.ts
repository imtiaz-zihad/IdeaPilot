import mongoose, { Document, Schema } from "mongoose";

export interface IStartup extends Document {
  userId: mongoose.Types.ObjectId;
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
  stage: "idea" | "mvp" | "growth" | "scale";
  investorScore?: number;
  createdAt: Date;
}

const startupSchema = new Schema<IStartup>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    startupName:    { type: String, required: true, trim: true },
    idea:           { type: String, required: true },
    industry:       { type: String, required: true },
    targetAudience: { type: String, required: true },
    country:        { type: String, required: true },
    stage:          { type: String, enum: ["idea", "mvp", "growth", "scale"], default: "idea" },
    investorScore:  { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

// Index for fast user-based queries
startupSchema.index({ userId: 1, createdAt: -1 });

export const Startup = mongoose.model<IStartup>("Startup", startupSchema);
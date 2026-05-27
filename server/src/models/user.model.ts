import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  provider: "local" | "google" | "github";
  refreshToken?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, select: false },
    avatar:       { type: String },
    provider:     { type: String, enum: ["local", "google", "github"], default: "local" },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
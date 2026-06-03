import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  startupId: mongoose.Types.ObjectId;
  userId:    mongoose.Types.ObjectId;
  role:      "user" | "assistant";
  content:   string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    startupId: { type: Schema.Types.ObjectId, ref: "Startup", required: true },
    userId:    { type: Schema.Types.ObjectId, ref: "User",    required: true },
    role:      { type: String, enum: ["user", "assistant"],   required: true },
    content:   { type: String, required: true },
  },
  { timestamps: true }
);

messageSchema.index({ startupId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
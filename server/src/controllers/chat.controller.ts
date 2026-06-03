import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../services/chat.service";
import { sendSuccess, sendError } from "../utils/apiResponse";

// GET /api/chat/:startupId — fetch history
export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const startupId = Array.isArray(req.params.startupId)
      ? req.params.startupId[0]
      : req.params.startupId;
    const messages = await getChatHistory(startupId, req.userId!);
    // Return oldest first for display
    sendSuccess(res, { messages: messages.reverse() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch history";
    sendError(res, msg, 500);
  }
};

// POST /api/chat/:startupId — send message
export const postMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return sendError(res, "Message cannot be empty", 400);
    }

    const startupId = Array.isArray(req.params.startupId)
      ? req.params.startupId[0]
      : req.params.startupId;
    const aiResponse = await sendMessage(
      startupId,
      req.userId!,
      message.trim(),
    );

    sendSuccess(res, { response: aiResponse }, "Message sent");
  } catch (err: unknown) {
    console.error("Chat error:", err);
    const msg = err instanceof Error ? err.message : "Chat failed";
    sendError(res, msg, 500);
  }
};

// DELETE /api/chat/:startupId — clear history
export const clearHistory = async (req: AuthRequest, res: Response) => {
  try {
    const startupId = Array.isArray(req.params.startupId)
      ? req.params.startupId[0]
      : req.params.startupId;
    await clearChatHistory(startupId, req.userId!);
    sendSuccess(res, null, "Chat history cleared");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to clear history";
    sendError(res, msg, 500);
  }
};

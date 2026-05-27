import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, "Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const { userId } = verifyAccessToken(token);
    req.userId = userId;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
};
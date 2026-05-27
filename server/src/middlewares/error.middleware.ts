import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/apiResponse";

export const notFound = (req: Request, res: Response) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 Error:", err.message);
  sendError(res, err.message || "Internal server error", 500);
};
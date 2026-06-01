import { Request, Response } from "express";
import { z } from "zod";
import { registerUser, loginUser } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { verifyRefreshToken, generateAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await registerUser(
      body.name,
      body.email,
      body.password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
      },
      "Registered successfully",
      201,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    sendError(res, msg, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginUser(
      body.email,
      body.password,
    );

    // wherever you set the refreshToken cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // always true for cross-domain
      sameSite: "none", // ✅ required for cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(
      res,
      {
        user: { id: user._id, name: user.name, email: user.email },
        accessToken,
      },
      "Logged in successfully",
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Login failed";
    sendError(res, msg, 401);
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return sendError(res, "No refresh token", 401);

    const { userId } = verifyRefreshToken(token);
    const user = await User.findById(userId).select("+refreshToken");
    if (!user || user.refreshToken !== token)
      return sendError(res, "Invalid refresh token", 401);

    const newAccessToken = generateAccessToken(userId);
    sendSuccess(res, { accessToken: newAccessToken }, "Token refreshed");
  } catch {
    sendError(res, "Invalid or expired refresh token", 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const { userId } = verifyRefreshToken(token);
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    }
    res.clearCookie("refreshToken");
    sendSuccess(res, null, "Logged out successfully");
  } catch {
    sendError(res, "Logout failed", 500);
  }
};

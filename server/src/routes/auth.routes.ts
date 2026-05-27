import { Router, Request, Response } from "express";
import passport from "passport";
import "../config/passport"; // initialize strategies
import {
  register,
  login,
  logout,
  refreshTokenHandler,
} from "../controllers/auth.controller";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { User } from "../models/user.model";
import { ENV } from "../config/env";
import { protect, AuthRequest } from "../middlewares/auth.middleware";
import { sendSuccess, sendError } from "../utils/apiResponse";

const router = Router();

// ─── Local Auth ──────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshTokenHandler);

// ─── Google OAuth ─────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${ENV.CLIENT_URL}/login?error=google_failed` }),
  handleOAuthCallback
);

// ─── GitHub OAuth ─────────────────────────────────────────
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${ENV.CLIENT_URL}/login?error=github_failed` }),
  handleOAuthCallback
);

router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-password -refreshToken");
  if (!user) return sendError(res, "User not found", 404);
  sendSuccess(res, { user });
});

// ─── Shared OAuth handler ─────────────────────────────────
async function handleOAuthCallback(req: Request, res: Response) {
  try {
    const user = req.user as any;

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { refreshToken });

    // HttpOnly refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token in URL (frontend stores in memory)
    res.redirect(`${ENV.CLIENT_URL}/auth/callback?token=${accessToken}`);
  } catch {
    res.redirect(`${ENV.CLIENT_URL}/login?error=oauth_failed`);
  }
}

export default router;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import authRoutes from "./routes/auth.routes";
import startupRoutes from "./routes/startup.routes";
import { notFound, globalErrorHandler } from "./middlewares/error.middleware";

import passport from "passport";
import "./config/passport";
import validatorRoutes from "./routes/validator.routes";
import brandingRoutes from "./routes/branding.routes";
import pitchDeckRoutes from "./routes/pitchdeck.routes";

const app = express();

// Security
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(passport.initialize());


// Middleware
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",     authRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/startups", validatorRoutes); // mounts as /api/startups/:id/validate
app.use("/api/startups", brandingRoutes);
app.use("/api/startups", pitchDeckRoutes);

// Error handlers
app.use(notFound);
app.use(globalErrorHandler);

connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
});
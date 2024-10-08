import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import bookmarkRoutes from "./routes/bookmarkRoutes";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { protect } from "./controllers/authenticationController";
import asyncHandler from "./utils/asyncHandler";
import passport from "passport";
import cookieParser from "cookie-parser";
import { limiter } from "./middleware/rateLimiter";
const { xss } = require("express-xss-sanitizer");
require("./strategies/google");

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cookieParser());
app.use(passport.initialize());
app.use(limiter);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/bookmarks", bookmarkRoutes);

app.get("/api/v1/hello", asyncHandler(protect), (_req, res, _next) => {
  res.status(200).json({ message: "hello world" });
});

// Unhandled Routes
app.all("*", (req: Request, _res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(globalErrorHandler);

export default app;

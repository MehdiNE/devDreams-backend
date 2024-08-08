import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { protect } from "./controllers/authenticationController";
import asyncHandler from "./utils/asyncHandler";
import passport from "passport";
const { xss } = require("express-xss-sanitizer");
import cookieParser from "cookie-parser";
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

// Routes
app.use("/api/v1/auth", authRoutes);

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

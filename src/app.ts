import express, { Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
const { xss } = require("express-xss-sanitizer");

const app = express();

// Middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(ExpressMongoSanitize());
app.use(xss());
app.use(hpp());

// Routes
app.use("/api/v1/users", userRoutes);

// Unhandled Routes
app.all("*", (req: Request, _res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(globalErrorHandler);

export default app;

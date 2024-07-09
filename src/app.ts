import express, { Request, Response } from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import AppError from "./utils/appError";
import globalErrorHandler from "./controllers/errorController";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/v1/users", userRoutes);

// Unhandled Routes
app.all("*", (req: Request, _res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling
app.use(globalErrorHandler);

export default app;

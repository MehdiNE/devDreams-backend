import { ErrorRequestHandler, Response } from "express";
import { ValidationError } from "express-validator";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: ValidationError[];
}

function sendErrorDev(err: AppError, res: Response) {
  res.status(err.statusCode ?? 500).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    ...(err.errors && { errors: err.errors }),
  });
}

function sendErrorProd(err: AppError, res: Response) {
  // Trusted error
  if (err.isOperational) {
    res.status(err.statusCode ?? 500).json({
      status: err.status,
      message: err.message,
    });

    // Programming or unknown error
  } else {
    console.log("ERROR", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
}

const globalErrorHandler: ErrorRequestHandler = (
  err: AppError,
  _req,
  res: Response,
  _next
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(err, res);
  }
};

export default globalErrorHandler;

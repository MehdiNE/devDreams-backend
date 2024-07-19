import { ErrorRequestHandler, Response } from "express";
import { ValidationError } from "express-validator";
import AppError from "../utils/appError";

interface ErrorType extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errors?: ValidationError[];
}

function handleJWTError() {
  return new AppError("Invalid Token. Please login again!", 401);
}

function handleJWTExpiredError() {
  return new AppError("Your token has expired!. Please login again.", 401);
}

function sendErrorDev(err: ErrorType, res: Response) {
  res.status(err.statusCode ?? 500).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    ...(err.errors && { errors: err.errors }),
  });
}

function sendErrorProd(err: ErrorType, res: Response) {
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
      message: err.message,
    });
  }
}

const globalErrorHandler: ErrorRequestHandler = (
  err: ErrorType,
  _req,
  res: Response,
  _next
) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV!.trim() === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV!.trim() === "production") {
    let error = { ...err };

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;

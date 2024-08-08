import { ValidationError } from "express-validator";

export type StatusType = "success" | "error" | "fail";

export type ApiResponse = {
  status: StatusType;
  message: string;
  errors?: ValidationError[];
};

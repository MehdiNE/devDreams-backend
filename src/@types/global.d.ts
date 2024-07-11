import { ValidationError } from "express-validator";

export type StatusType = "success" | "error" | "fail";

export interface ErrorResponse {
  status: StatusType;
  message: string;
  errors?: ValidationError[];
}

import { Request, Response } from "express";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "../types/authenticationTypes";
import { ErrorResponse } from "../types/global";
import { validateRequest } from "../utils/validateRequest";
import {
  loginValidator,
  registerValidator,
} from "../validators/authenticationValidators";
import { loginService, signupService } from "../services/authenticationService";
import AppError from "../utils/appError";

export async function handleSignup(
  req: Request<{}, {}, SignupRequest>,
  res: Response<SignupResponse | ErrorResponse>
) {
  // Validation
  const errors = await validateRequest(req, registerValidator);
  if (!errors.isEmpty()) {
    throw new AppError("inputs are not valid.", 400, errors.array());
  }

  const { username, email, password } = req.body;

  const { user, token } = await signupService({
    username,
    email,
    password,
  });

  res?.status(201).json({
    status: "success",
    message: "User created successfully.",
    data: {
      ...user,
      token,
    },
  });
}

export async function handleLogin(
  req: Request<{}, {}, LoginRequest>,
  res: Response<LoginResponse | ErrorResponse>
) {
  const { email, password } = req.body;
  // Validation
  const errors = await validateRequest(req, loginValidator);
  if (!errors.isEmpty()) {
    throw new AppError("inputs are not valid.", 400, errors.array());
  }

  const { user, token } = await loginService({ email, password });

  res?.status(200).json({
    status: "success",
    message: "User logged in successfully.",
    data: {
      ...user,
      token,
    },
  });
}

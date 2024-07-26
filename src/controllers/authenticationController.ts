import { NextFunction, Request, Response } from "express";
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordParams,
  ResetPasswordRequest,
  SignupRequest,
  SignupResponse,
  UpdatePasswordServiceRequest,
} from "../types/authenticationTypes";
import { ErrorResponse } from "../types/global";
import { validateRequest } from "../utils/validateRequest";
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updatePasswordValidator,
} from "../validators/authenticationValidators";
import {
  forgotPasswordService,
  googleRedirectService,
  loginService,
  protectService,
  refreshTokenService,
  resetPasswordService,
  signOutService,
  signupService,
  updatePasswordService,
} from "../services/authenticationService";
import AppError from "../utils/appError";

const cookieOption = {
  secure: true,
  httpOnly: true,
};

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

  res
    ?.status(201)
    .cookie("accessToken", token.accessToken, cookieOption)
    .cookie("refreshToken", token.refreshToken, cookieOption)
    .json({
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

  const { user, token } = await loginService({
    email,
    password,
  });

  res
    ?.status(200)
    .cookie("accessToken", token.accessToken, cookieOption)
    .cookie("refreshToken", token.refreshToken, cookieOption)
    .json({
      status: "success",
      message: "User logged in successfully.",
      data: {
        ...user,
        token,
      },
    });
}

export async function handleSignOut(
  req: Request<{}, {}, LoginRequest>,
  res: Response<LoginResponse | ErrorResponse>
) {
  const userId = req.userId;

  if (!userId) {
    throw new AppError("User id not found", 401);
  }

  await signOutService({ userId });

  return res
    .status(200)
    .cookie("accessToken", cookieOption)
    .cookie("refreshToken", cookieOption)
    .json({ status: "success", message: "Logged out successfully" });
}

export async function refreshTokenHandler(
  req: Request<{}, {}, LoginRequest>,
  res: Response<any | ErrorResponse>
) {
  // Look for the token in cookies or headers
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // If there's no token, deny access with a 401 Unauthorized status
  if (!accessToken) {
    throw new AppError("access Token not found", 401);
  }

  const incomingRefreshToken = req.headers.refreshtoken as string;

  if (!incomingRefreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  const { token } = await refreshTokenService({
    refreshToken: incomingRefreshToken,
  });

  res
    .status(200)
    .cookie("accessToken", token.accessToken, cookieOption)
    .cookie("refreshToken", token.refreshToken, cookieOption)
    .json({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      message: "Access token refreshed",
    });
}

export async function protect(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("You are not log in! Please log in to get access.", 401);
  }

  const { currentUser } = await protectService(token);

  req.userId = String(currentUser?._id);

  next();
}

export async function forgotPassword(
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response
) {
  const { email } = req.body;
  // Validation
  const errors = await validateRequest(req, forgotPasswordValidator);
  if (!errors.isEmpty()) {
    throw new AppError("inputs are not valid.", 400, errors.array());
  }

  await forgotPasswordService({ email });

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
}

export async function resetPassword(
  req: Request<ResetPasswordParams, {}, ResetPasswordRequest>,
  res: Response
) {
  const { token } = req.params;
  const { password } = req.body;

  // Validation
  const errors = await validateRequest(req, resetPasswordValidator);
  if (!errors.isEmpty()) {
    throw new AppError("inputs are not valid.", 400, errors.array());
  }

  const { newToken } = await resetPasswordService({
    token,
    password,
  });

  res
    ?.status(200)
    .cookie("accessToken", newToken.accessToken, cookieOption)
    .cookie("refreshToken", newToken.refreshToken, cookieOption)
    .json({
      status: "success",
      message: "Password changed successfully.",
      data: {
        newToken,
      },
    });
}

export async function updatePassword(
  req: Request<{}, {}, UpdatePasswordServiceRequest>,
  res: Response
) {
  const { currentPassword, newPassword } = req.body;

  // Validation
  const errors = await validateRequest(req, updatePasswordValidator);
  if (!errors.isEmpty()) {
    throw new AppError("inputs are not valid.", 400, errors.array());
  }

  const { token } = await updatePasswordService({
    id: req.userId ?? "",
    currentPassword,
    newPassword,
  });

  res
    .status(201)
    .cookie("accessToken", token.accessToken, cookieOption)
    .cookie("refreshToken", token.refreshToken, cookieOption)
    .json({
      status: "success",
      message: "Password updated successfully.",
      token,
    });
}

// Google
export async function googleRedirectController(req: Request, res: Response) {
  //@ts-ignore
  const token = await googleRedirectService(req.user._id);

  res
    ?.status(200)
    .cookie("accessToken", token.accessToken, cookieOption)
    .cookie("refreshToken", token.refreshToken, cookieOption)
    .json({
      status: "success",
      message: "User logged in successfully.",
      data: {
        token,
      },
    });
}

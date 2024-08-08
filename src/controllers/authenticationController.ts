import { CookieOptions, NextFunction, Request, Response } from "express";
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  ResetPasswordParams,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SignupRequest,
  SignupResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
} from "../types/authenticationTypes";
import { ApiResponse } from "../types/global";
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

const cookieOptions: CookieOptions = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict",
};

const sendTokenResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any
) => {
  const { accessToken, refreshToken, ...userData } = data;

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({
      status: "success",
      message,
      data: userData,
    });
};

export const handleSignup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response<SignupResponse>
) => {
  await validateRequest(req, registerValidator);

  const { username, email, password } = req.body;
  const { user, token } = await signupService({ username, email, password });

  sendTokenResponse(res, 201, "User created successfully.", {
    ...user,
    ...token,
  });
};

export const handleLogin = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response<LoginResponse>
) => {
  await validateRequest(req, loginValidator);

  const { email, password } = req.body;
  const { user, token } = await loginService({ email, password });

  sendTokenResponse(res, 200, "User logged in successfully.", {
    ...user,
    ...token,
  });
};

export const handleSignOut = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new AppError("User id not found", 401);

  await signOutService(userId);

  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ status: "success", message: "Logged out successfully" });
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response<RefreshTokenResponse>
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) throw new AppError("Access Token not found", 401);

  const incomingRefreshToken = req.cookies?.refreshToken;
  const token = await refreshTokenService(incomingRefreshToken);

  sendTokenResponse(res, 200, "Access token refreshed", token);
};

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken)
    throw new AppError(
      "You are not logged in! Please log in to get access.",
      401
    );

  const { currentUser } = await protectService(accessToken);
  req.userId = String(currentUser?._id);
  next();
};

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordRequest>,
  res: Response<ApiResponse>
) => {
  await validateRequest(req, forgotPasswordValidator);

  const { email } = req.body;
  await forgotPasswordService({ email });

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
};

export const resetPassword = async (
  req: Request<ResetPasswordParams, {}, ResetPasswordRequest>,
  res: Response<ResetPasswordResponse>
) => {
  await validateRequest(req, resetPasswordValidator);

  const { token } = req.params;
  const { password } = req.body;
  const newToken = await resetPasswordService({ token, password });

  sendTokenResponse(res, 200, "Password changed successfully.", newToken);
};

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordRequest>,
  res: Response<UpdatePasswordResponse>
) => {
  await validateRequest(req, updatePasswordValidator);

  const { currentPassword, newPassword } = req.body;
  const token = await updatePasswordService({
    id: req.userId ?? "",
    currentPassword,
    newPassword,
  });

  sendTokenResponse(res, 201, "Password updated successfully.", token);
};

// Google
export const googleRedirectController = async (req: Request, res: Response) => {
  //@ts-ignore
  const token = await googleRedirectService(req.user._id);

  // Consider using a more secure method for passing tokens, like encrypted JWE in a cookie
  const redirectUrl = new URL(
    `${process.env.FRONTEND_URL}/auth/google-redirect`
  );
  redirectUrl.searchParams.append("accessToken", token.accessToken);
  redirectUrl.searchParams.append("refreshToken", token.refreshToken);

  res.redirect(redirectUrl.toString());
};

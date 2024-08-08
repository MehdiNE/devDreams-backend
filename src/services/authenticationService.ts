import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { UserModel } from "../models/users";
import { Types } from "mongoose";
import {
  ForgotPasswordServiceProps,
  LoginRequest,
  ResetPasswordService,
  SignupServiceProps,
  UpdatePasswordServiceProps,
} from "../types/authenticationTypes";
import AppError from "../utils/appError";
import sendEmail from "../utils/email";
import jwtVerifyPromisified from "../utils/jwtVerifyPromisified";

const signToken = async (id: Types.ObjectId) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "30m",
  });

  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "15d",
  });

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const signupService = async ({
  username,
  email,
  password,
}: SignupServiceProps) => {
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const hashPassword = await bcrypt.hash(password, 12);
  const newUser = await UserModel.create({
    username,
    email,
    authMethods: ["local"],
    password: hashPassword,
  });

  const token = await signToken(newUser._id);

  return {
    user: { username: newUser.username, email: newUser.email },
    token,
  };
};

export const loginService = async ({ email, password }: LoginRequest) => {
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !user.authMethods.includes("local")) {
    throw new AppError("Invalid credentials or authentication method", 400);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password ?? "");
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 400);
  }

  const token = await signToken(user._id);

  return {
    user: { username: user.username, email: user.email },
    token,
  };
};

export const signOutService = async (userId: string) => {
  await UserModel.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    { new: true }
  );
};

export const refreshTokenService = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  const decoded = (await jwtVerifyPromisified(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!
  )) as { id: string; iat: number };

  const user = await UserModel.findById(decoded?.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  return signToken(user._id);
};

export const protectService = async (token: string) => {
  const decoded = (await jwtVerifyPromisified(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  )) as { id: string; iat: number };

  const currentUser = await UserModel.findById(decoded.id);

  if (!currentUser) {
    throw new AppError("User not found", 401);
  }

  if (
    currentUser.changedPasswordAt &&
    decoded.iat < currentUser.changedPasswordAt
  ) {
    throw new AppError(
      "User recently changed password. Please log in again.",
      401
    );
  }

  return { currentUser };
};

export const forgotPasswordService = async ({
  email,
}: ForgotPasswordServiceProps) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedResetToken;
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      email,
      subject: "Reset your password",
      message: `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Error sending email. Please try again later.", 500);
  }
};

export const resetPasswordService = async ({
  token,
  password,
}: ResetPasswordService) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  user.password = await bcrypt.hash(password, 12);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.changedPasswordAt = Date.now() - 1000;
  await user.save();

  return signToken(user._id);
};

export const updatePasswordService = async ({
  id,
  currentPassword,
  newPassword,
}: UpdatePasswordServiceProps) => {
  const user = await UserModel.findById(id).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password ?? ""
  );
  if (!isPasswordValid) {
    throw new AppError("Current password is incorrect", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.changedPasswordAt = Date.now() - 1000;
  await user.save();

  return signToken(user._id);
};

export const googleRedirectService = async (userId: Types.ObjectId) => {
  return signToken(userId);
};

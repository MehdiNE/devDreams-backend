import jwt from "jsonwebtoken";
import { UserModel } from "../models/users";
import {
  ForgotPasswordServiceProps,
  LoginRequest,
  ResetPasswordService,
  SignupRequest,
  UpdatePasswordServiceProps,
} from "../@types/authenticationTypes";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import AppError from "../utils/appError";
import crypto from "crypto";
import sendEmail from "../utils/email";

function signToken(id: Types.ObjectId) {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET ?? "", {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export async function signupService({
  username,
  email,
  password,
}: Omit<SignupRequest, "confirmPassword">) {
  try {
    const duplicate = await UserModel.findOne({ email });

    if (duplicate) {
      throw new AppError("User already exists", 409); // 409 Conflict is more appropriate for duplicates
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
      username,
      email,
      password: hashPassword,
    });

    const token = signToken(newUser._id);

    return {
      user: { username: newUser.username, email: newUser.email },
      token,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error; // Re-throw AppErrors without modification
    }
    throw new AppError("Something went wrong", 500);
  }
}

export async function loginService({ email, password }: LoginRequest) {
  // 1) Check if email and password exist`
  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  // 2) Check if user exists && password is correct
  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user?.password))) {
    throw new AppError("Incorrect email or password", 400);
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);

  return { user: { username: user.username, email: user.email }, token };
}

export async function protectService(token: string) {
  // 1) Getting token and check if it's there
  // 2) Verification token
  const jwtVerifyPromisified = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, {}, (err, payload) => {
        if (err) {
          reject(err);
        } else {
          resolve(payload);
        }
      });
    });
  };

  const decoded = (await jwtVerifyPromisified(
    token,
    process.env.ACCESS_TOKEN_SECRET ?? ""
  )) as { id: string; iat: number };

  // 3) Check if user still exist
  const currentUser = await UserModel.findById(decoded.id);

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token does no longer exist.",
      401
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAt) {
    if (decoded.iat < currentUser.changedPasswordAt) {
      throw new AppError(
        "User recently changed password! Please log in again.",
        401
      );
    }
  }

  // Return fresh user
  return { currentUser };
}

export async function forgotPasswordService({
  email,
}: ForgotPasswordServiceProps) {
  // 1) Get user based om email
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new AppError("There is no user with this email address", 404);
  }

  // 2) generate the random reset token and save hashed token to database
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await UserModel.updateOne(
    { email },
    {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: Date.now() + 10 * 60 * 1000,
    }
  );

  // 3) return unhashed user token
  try {
    await sendEmail({
      email,
      subject: "Reset your password",
      message: resetToken,
    });
  } catch (error) {
    await UserModel.updateOne(
      { email },
      {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      }
    );

    throw new AppError(
      "There was an error sending the email. Try again later.",
      500
    );
  }
}

export async function resetPasswordService({
  token,
  password,
}: ResetPasswordService) {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token not expired, and there is user, set new password
  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.changedPasswordAt = Date.now() - 1000;
  await user.save();

  // 3) Log the user in, send JWT
  const loginToken = signToken(user._id);

  return { loginToken };
}

export async function updatePasswordService({
  id,
  currentPassword,
  newPassword,
}: UpdatePasswordServiceProps) {
  // 1) Get user from collection
  const user = await UserModel.findById(id).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2) Check if POSTed current password is correct
  if (!(await bcrypt.compare(currentPassword, user?.password))) {
    throw new AppError("Current password is wrong!", 400);
  }

  // 3) If so, update password
  const hashPassword = await bcrypt.hash(newPassword, 12);

  user.password = hashPassword;
  user.changedPasswordAt = Date.now() - 1000;
  await user.save();

  // 4) Log user in, send JWT
  const token = signToken(user._id);

  return { token };
}

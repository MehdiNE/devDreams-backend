import jwt from "jsonwebtoken";
import { UserModel } from "../models/users";
import { LoginRequest, SignupRequest } from "../types/authenticationTypes";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import AppError from "../utils/appError";

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

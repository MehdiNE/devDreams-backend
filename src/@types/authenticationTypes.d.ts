import { StatusType } from "./global";

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  data: {
    token: string;
    username: string;
    email: string;
  };
  status: StatusType;
  message: string;
}

export type LoginRequest = Omit<SignupRequest, "username" | "confirmPassword">;

export type LoginResponse = SignupResponse;

// Forgot password
export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordServiceProps = ForgotPasswordRequest;

// Reset password
export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

export type ResetPasswordParams = { token: string };

export interface ResetPasswordService {
  token: string;
  password: string;
}

// Update password
export interface UpdatePasswordServiceProps {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordServiceRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

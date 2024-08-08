import { ApiResponse, StatusType } from "./global";

// Signup
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse extends ApiResponse {
  data: {
    token: {
      accessToken: String;
      refreshToken: string;
    };
    username?: string | null;
    email: string;
  };
}

export type SignupServiceProps = Omit<SignupRequest, "confirmPassword">;

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

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

export interface ResetPasswordResponse extends ApiResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export type ResetPasswordParams = { token: string };

export interface ResetPasswordService {
  token: string;
  password: string;
}

// Update password
export interface UpdatePasswordRequest {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse extends ApiResponse {
  accessToken: string;
  refreshToken: string;
}

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

// Refresh token
export interface RefreshTokenResponse extends ApiResponse {
  accessToken: string;
  refreshToken: string;
}

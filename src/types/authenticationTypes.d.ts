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

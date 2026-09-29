export const UserRole = {
  CITIZEN: "citizen",
  STUDENT: "student",
  FACULTY: "faculty",
  INDUSTRY: "industry",
  GOVERNMENT: "government",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  PENDING: "PENDING",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: string;
  full_name: string;
  email: string;
  username?: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  is_verified: boolean;
  trust_score: number;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  role: UserRole;
  user_id: string;
  full_name: string;
  email: string;
}

export interface RegisterResponseData {
  user_id: string;
  message: string;
}

export interface RefreshTokenResponseData {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface StandardResponse<T> {
  success: true;
  data: T;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
}

export type ApiResponse<T> = StandardResponse<T> | ErrorResponse;

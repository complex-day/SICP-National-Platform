import { apiClient } from "@/lib/api";
import {
  LoginResponseData,
  RegisterResponseData,
  RefreshTokenResponseData,
  User,
} from "@/types/auth.types";
import {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/features/auth/auth.schema";

export const authService = {
  async register(data: RegisterInput): Promise<RegisterResponseData> {
    return apiClient<RegisterResponseData>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginInput): Promise<LoginResponseData> {
    return apiClient<LoginResponseData>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async refresh(refreshToken: string): Promise<RefreshTokenResponseData> {
    return apiClient<RefreshTokenResponseData>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async getCurrentUser(token: string): Promise<User> {
    return apiClient<User>("/auth/me", {
      method: "GET",
      token,
    });
  },

  async logout(token: string, refreshToken?: string | null): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
      token,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async changePassword(token: string, data: ChangePasswordInput): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/change-password", {
      method: "POST",
      token,
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    return apiClient<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

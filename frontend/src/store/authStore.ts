import { create } from "zustand";
import { User, LoginResponseData, UserRole } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  
  // Actions
  setAuth: (data: LoginResponseData) => void;
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

const getStoredToken = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

const getStoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem("sicp_user");
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialAccessToken = getStoredToken("sicp_access_token");
  const initialRefreshToken = getStoredToken("sicp_refresh_token");
  const initialUser = getStoredUser();

  return {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: !!initialAccessToken,
    role: initialUser ? initialUser.role : null,

    setAuth: (data: LoginResponseData) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("sicp_access_token", data.access_token);
        localStorage.setItem("sicp_refresh_token", data.refresh_token);
        const tempUser: Partial<User> = {
          id: data.user_id,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          status: "ACTIVE",
          is_verified: false,
          trust_score: 50.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem("sicp_user", JSON.stringify(tempUser));
      }

      set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        role: data.role,
        user: {
          id: data.user_id,
          full_name: data.full_name,
          email: data.email,
          role: data.role,
          status: "ACTIVE",
          is_verified: false,
          trust_score: 50.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    },

    setUser: (user: User) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("sicp_user", JSON.stringify(user));
      }
      set({ user, role: user.role });
    },

    setAccessToken: (token: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("sicp_access_token", token);
      }
      set({ accessToken: token, isAuthenticated: true });
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sicp_access_token");
        localStorage.removeItem("sicp_refresh_token");
        localStorage.removeItem("sicp_user");
      }
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        role: null,
      });
    },
  };
});

import { create } from "zustand";
import { apiClient, configureApiClient, parseJwtPayload, type UserRole } from "@itp/utils";

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string, role: UserRole) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  setAuth: (accessToken, userId, role) =>
    set({ accessToken, userId, role, isAuthenticated: true }),
  clearAuth: () =>
    set({ accessToken: null, userId: null, role: null, isAuthenticated: false }),
}));

let configured = false;

export function initAuthClient(onUnauthorized?: () => void) {
  if (configured) return;
  configured = true;
  configureApiClient({
    getAccessToken: () => useAuthStore.getState().accessToken,
    setAccessToken: (token) => {
      if (token) {
        const payload = parseJwtPayload(token);
        const userId = payload?.sub as string | undefined;
        const role = payload?.role as UserRole | undefined;
        if (userId && role) {
          useAuthStore.getState().setAuth(token, userId, role);
        }
      } else {
        useAuthStore.getState().clearAuth();
      }
    },
    onUnauthorized: () => {
      useAuthStore.getState().clearAuth();
      onUnauthorized?.();
    },
  });
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  role: UserRole;
  user_id: string;
}

export function useAuth() {
  const { accessToken, userId, role, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<LoginResult>("/auth/login", credentials);
    setAuth(data.access_token, data.user_id, data.role as UserRole);
    return data;
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      clearAuth();
    }
  };

  const hasRole = (...roles: UserRole[]) => role !== null && roles.includes(role);

  return {
    accessToken,
    userId,
    role,
    isAuthenticated,
    login,
    logout,
    hasRole,
    clearAuth,
  };
}

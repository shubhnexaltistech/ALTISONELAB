import { create } from "zustand";
import { apiClient, configureApiClient, parseJwtPayload, type UserRole } from "@itp/utils";
import type { AuthUser } from "@itp/types";

export interface AuthState {
  accessToken: string | null;
  userId: string | null;
  role: UserRole | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userId: string, role: UserRole, user?: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userId: null,
  role: null,
  user: null,
  isAuthenticated: false,
  setAuth: (accessToken, userId, role, user = null) =>
    set({ accessToken, userId, role, user, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clearAuth: () =>
    set({ accessToken: null, userId: null, role: null, user: null, isAuthenticated: false }),
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
          void fetchCurrentUser();
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

async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get<AuthUser>("/auth/me");
    useAuthStore.getState().setUser(data);
  } catch {
    // keep JWT-derived auth if /me fails
  }
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
  const { accessToken, userId, role, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<LoginResult>("/auth/login", credentials);
    setAuth(data.access_token, data.user_id, data.role as UserRole);
    await fetchCurrentUser();
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
    user,
    isAuthenticated,
    login,
    logout,
    hasRole,
    clearAuth,
  };
}

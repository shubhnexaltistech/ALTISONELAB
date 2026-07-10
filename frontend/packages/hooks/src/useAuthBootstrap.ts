import { useEffect, useState } from "react";
import axios from "axios";
import { API_V1, parseJwtPayload, type UserRole, apiClient } from "@itp/utils";
import type { AuthUser } from "@itp/types";
import { useAuthStore } from "./useAuth";

export function useAuthBootstrap() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.post<{ access_token: string }>(
          `${API_V1}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const payload = parseJwtPayload(data.access_token);
        const userId = payload?.sub as string | undefined;
        const role = payload?.role as UserRole | undefined;
        if (userId && role) {
          setAuth(data.access_token, userId, role);
          try {
            const { data: me } = await apiClient.get<AuthUser>("/auth/me", {
              headers: { Authorization: `Bearer ${data.access_token}` },
            });
            setUser(me);
          } catch {
            // ignore
          }
        } else {
          clearAuth();
        }
      } catch {
        clearAuth();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setAuth, setUser, clearAuth]);

  return { isBootstrapping };
}

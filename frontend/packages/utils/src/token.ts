export type UserRole = "admin" | "trainee" | "mentor";

export interface AuthUser {
  userId: string;
  role: UserRole;
}

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return Date.now() >= (payload.exp - bufferSeconds) * 1000;
}

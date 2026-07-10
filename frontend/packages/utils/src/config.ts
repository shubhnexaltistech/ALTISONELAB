export const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:8000";

export const API_V1 = `${API_BASE_URL}/api/v1`;

export const PORTAL_URLS = {
  landing:
    (import.meta as ImportMeta & { env?: { VITE_LANDING_URL?: string } }).env?.VITE_LANDING_URL ||
    "http://localhost:3000",
  admin:
    (import.meta as ImportMeta & { env?: { VITE_ADMIN_URL?: string } }).env?.VITE_ADMIN_URL ||
    "http://localhost:3001",
  lms:
    (import.meta as ImportMeta & { env?: { VITE_LMS_URL?: string } }).env?.VITE_LMS_URL ||
    "http://localhost:3002",
  mentor:
    (import.meta as ImportMeta & { env?: { VITE_MENTOR_URL?: string } }).env?.VITE_MENTOR_URL ||
    "http://localhost:3003",
};

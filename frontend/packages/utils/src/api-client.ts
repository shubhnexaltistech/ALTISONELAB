import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_V1 } from "./config";

export type TokenGetter = () => string | null;
export type TokenSetter = (token: string | null) => void;
export type OnUnauthorized = () => void;

let getAccessToken: TokenGetter = () => null;
let setAccessToken: TokenSetter = () => {};
let onUnauthorized: OnUnauthorized = () => {};

export function configureApiClient(config: {
  getAccessToken: TokenGetter;
  setAccessToken: TokenSetter;
  onUnauthorized?: OnUnauthorized;
}) {
  getAccessToken = config.getAccessToken;
  setAccessToken = config.setAccessToken;
  if (config.onUnauthorized) onUnauthorized = config.onUnauthorized;
}

export const apiClient = axios.create({
  baseURL: API_V1,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      if (original.url?.includes("/auth/login") || original.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error);
              return;
            }
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ access_token: string }>(
          `${API_V1}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.access_token);
        processQueue(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(null);
        setAccessToken(null);
        onUnauthorized();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg).join(", ");
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

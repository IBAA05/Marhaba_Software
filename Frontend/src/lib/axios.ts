import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/stores/authStore";
import type { ApiEnvelope, TokenPair } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
export const REFRESH_STORAGE_KEY = "luxe.refresh_token";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ---- Request interceptor: attach access token -----------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Response interceptor: auto refresh on 401 ----------------------------
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh the refresh/login endpoints themselves.
    if (
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/refresh")
    ) {
      useAuthStore.getState().logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers = original.headers ?? {};
            (original.headers as Record<string, string>).Authorization =
              `Bearer ${token}`;
            original._retry = true;
            resolve(api(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken =
        useAuthStore.getState().refreshToken ??
        localStorage.getItem(REFRESH_STORAGE_KEY);
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<ApiEnvelope<{ access_token: string }>>(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: refreshToken },
        { withCredentials: true },
      );
      const newToken = data.data.access_token;
      useAuthStore.getState().setAccessToken(newToken);
      flushQueue(null, newToken);

      original.headers = original.headers ?? {};
      (original.headers as Record<string, string>).Authorization =
        `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ---- Helpers --------------------------------------------------------------
/** Unwrap the standard API envelope and return the data payload. */
export async function unwrap<T>(
  promise: Promise<{ data: ApiEnvelope<T> }>,
): Promise<T> {
  const res = await promise;
  return res.data.data;
}

/** Unwrap an envelope but keep pagination metadata. */
export async function unwrapList<T>(
  promise: Promise<{ data: ApiEnvelope<T[]> }>,
): Promise<{ items: T[]; pagination?: ApiEnvelope<T[]>["pagination"] }> {
  const res = await promise;
  return { items: res.data.data, pagination: res.data.pagination };
}

export function persistRefreshToken(tokens: TokenPair) {
  localStorage.setItem(REFRESH_STORAGE_KEY, tokens.refresh_token);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_STORAGE_KEY);
}

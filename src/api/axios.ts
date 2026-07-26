import axios, {
  AxiosHeaders,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { endpoints } from "./endpoints";
import { tokenStorage } from "../utils/storage";
import type { ApiResponse } from "../types/common";
import type { AuthResponse } from "../types/auth";

declare global {
  interface Window {
    /** Runtime config injected by /public/config.js — editable post-build, no rebuild required. */
    __APP_CONFIG__?: { API_BASE_URL?: string };
  }
}

/**
 * Resolved in priority order: runtime /config.js (production deploys — edit and refresh,
 * no rebuild) → Vite build-time env var (local dev via .env) → localhost fallback.
 */
export const API_BASE_URL: string =
  window.__APP_CONFIG__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "https://localhost:7153/api";

/** Origin only (no /api suffix) — used to resolve /media/... image paths returned by the API. */
export const API_ORIGIN: string = API_BASE_URL.replace(/\/api\/?$/, "");

export interface ApiClientError {
  message: string;
  errors?: string[];
  statusCode?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? new AxiosHeaders();
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Unwraps the backend's { success, message, data, errors } envelope so callers just get `data`.
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    if (response.data && typeof response.data === "object" && "success" in response.data) {
      (response as AxiosResponse<unknown>).data = response.data.data;
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    const envelope = error.response?.data;
    const clientError: ApiClientError = {
      message: envelope?.message || error.message || "Something went wrong.",
      errors: envelope?.errors,
      statusCode: error.response?.status,
    };

    console.error(
      `[API] ${error.config?.method?.toUpperCase() ?? "?"} ${error.config?.url ?? "?"} failed` +
        (clientError.statusCode ? ` (${clientError.statusCode})` : ""),
      {
        message: clientError.message,
        errors: clientError.errors,
        params: error.config?.params,
        response: envelope,
      },
    );

    return Promise.reject(Object.assign(error, { clientError }));
  },
);

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  const accessToken = tokenStorage.getAccessToken();
  if (!refreshToken || !accessToken) return null;

  try {
    const { data } = await axios.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}${endpoints.auth.refresh}`,
      { accessToken, refreshToken },
    );
    const auth = data.data;
    if (!auth) return null;
    tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
    return auth.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes(endpoints.auth.login) ||
      originalRequest?.url?.includes(endpoints.auth.refresh);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? new AxiosHeaders();
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }

      tokenStorage.clear();
      if (window.location.pathname.startsWith("/admin")) {
        window.location.assign("/admin/login");
      }
    }

    return Promise.reject(error);
  },
);

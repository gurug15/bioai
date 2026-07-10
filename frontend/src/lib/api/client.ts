import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export const apiClient = axios.create({
  baseURL: "http://localhost:5555/api",
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor — attach CSRF token for access-protected endpoints
apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie("csrf_access_token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — on 401, try to refresh once then retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const csrfRefreshToken = getCookie("csrf_refresh_token");
        await axios.post(
          "http://localhost:5555/api/auth/refresh",
          {},
          {
            withCredentials: true,
            headers: csrfRefreshToken
              ? { "X-CSRF-Token": csrfRefreshToken }
              : undefined,
          }
        );

        // Attach fresh CSRF token after refresh
        const newCsrfToken = getCookie("csrf_access_token");
        if (newCsrfToken) {
          originalRequest.headers["X-CSRF-Token"] = newCsrfToken;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear auth state and notify the React layer
        window.dispatchEvent(new CustomEvent("auth:logout"));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

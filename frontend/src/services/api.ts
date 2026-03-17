import axios, { AxiosError, AxiosInstance } from "axios";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getApiBaseUrl = () => {
  const configuredUrl =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

// Get secure token storage
const getStorage = () => {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return typeof window !== "undefined" ? window.localStorage : null;
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use((config) => {
  const storage = getStorage();
  const token = storage?.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const storage = getStorage();
      const refreshToken = storage?.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
          );

          // Store new access token securely
          storage?.setItem("accessToken", data.accessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          storage?.removeItem("accessToken");
          storage?.removeItem("refreshToken");
          storage?.removeItem("user");
          storage?.removeItem("tokenExpiry");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        storage?.removeItem("accessToken");
        storage?.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

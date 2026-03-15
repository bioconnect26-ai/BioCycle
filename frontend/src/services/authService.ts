import apiClient from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "super_admin" | "admin" | "editor" | "viewer";
    status: "active" | "inactive" | "pending";
    profileImage?: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Storage strategy: Use sessionStorage (cleared on browser close) for tokens
// Fall back to localStorage for user session persistence
const useSecureStorage = () => {
  // Try to use sessionStorage if available
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return typeof window !== "undefined" ? window.localStorage : null;
};

export const authService = {
  login: async (credentials: LoginCredentials) => {
    try {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
      );

      // Store tokens securely
      const storage = useSecureStorage();
      if (storage) {
        storage.setItem("accessToken", data.accessToken);
        storage.setItem("refreshToken", data.refreshToken);
        // User info in sessionStorage is okay as it doesn't contain secrets
        storage.setItem("user", JSON.stringify(data.user));
        // Store token expiration for better UX
        storage.setItem(
          "tokenExpiry",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        );
      }

      return data;
    } catch (error: any) {
      // Handle account lockout
      if (error.response?.status === 429) {
        throw {
          ...error,
          isLocked: true,
          lockMessage:
            error.response?.data?.message ||
            "Account temporarily locked. Try again in 30 minutes.",
        };
      }
      throw error;
    }
  },

  register: async (registerData: RegisterData) => {
    const { data } = await apiClient.post("/auth/register", registerData);
    return data;
  },

  getProfile: async () => {
    const { data } = await apiClient.get("/auth/profile");
    return data;
  },

  updateProfile: async (fullName: string, profileImage?: string) => {
    const { data } = await apiClient.put("/auth/profile", {
      fullName,
      profileImage,
    });
    return data;
  },

  logout: () => {
    const storage = useSecureStorage();
    if (storage) {
      storage.removeItem("accessToken");
      storage.removeItem("refreshToken");
      storage.removeItem("user");
      storage.removeItem("tokenExpiry");
    }
  },

  getCurrentUser: () => {
    const storage = useSecureStorage();
    if (!storage) return null;

    const userStr = storage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getAccessToken: () => {
    const storage = useSecureStorage();
    if (!storage) return null;
    return storage.getItem("accessToken");
  },

  // Check if token is expired
  isTokenExpired: () => {
    const storage = useSecureStorage();
    if (!storage) return true;

    const expiry = storage.getItem("tokenExpiry");
    if (!expiry) return true;

    return new Date() > new Date(expiry);
  },

  // Clear all auth data on logout or session expiry
  clearAuthData: () => {
    authService.logout();
  },
};

export default authService;

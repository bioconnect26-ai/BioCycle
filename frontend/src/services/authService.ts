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

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
    );

    // Store tokens and user
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data;
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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getAccessToken: () => localStorage.getItem("accessToken"),
};

export default authService;

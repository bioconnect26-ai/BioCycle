import apiClient from "./api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending_approval";
  about?: string;
  bio?: string;
  profileImage?: string;
  expertise?: string[];
  requestDate?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalEditors: number;
  onlineUsers: number;
  lockedUsers: number;
  newUsersThisWeek: number;
  totalCycles: number;
  publishedCycles: number;
  draftCycles: number;
  pendingReviewCycles: number;
  updatedCyclesToday: number;
  newCyclesThisWeek: number;
  activeEditors: number;
  pendingApproval: number;
  recentActivity: {
    id: string;
    title: string;
    user: string;
    action: string;
    entityType: string;
    entityId: string;
    time: string;
    createdAt: string;
    changes?: Record<string, unknown>;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: User["role"];
    status: "active" | "inactive" | "pending";
    lastLogin?: string;
    lastSeen: string;
    isOnline: boolean;
    createdAt: string;
  }[];
  recentCycles: {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "pending_review" | "published";
    updatedAt: string;
    publishedAt?: string;
    lastUpdated: string;
    creator: string;
    updater: string;
  }[];
  activitySummary: Record<string, number>;
  topContributors: {
    id: string;
    name: string;
    email: string;
    role: User["role"];
    actions: number;
  }[];
}

export const userService = {
  // Get all users (admin)
  getAllUsers: async (page = 1, limit = 10, role = "") => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(role && { role }),
    });

    const { data } = await apiClient.get(`/users?${params}`);
    return data;
  },

  // Get pending editors (admin)
  getPendingEditors: async () => {
    const { data } = await apiClient.get("/users/pending-approval/list");
    return data;
  },

  // Get user by ID
  getUserById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  // Update user profile
  updateUserProfile: async (id: string, userData: Partial<User>) => {
    const { data } = await apiClient.put(`/users/${id}`, userData);
    return data;
  },

  // Approve editor request (admin)
  approveEditor: async (userId: string) => {
    const { data } = await apiClient.put(`/users/${userId}/approve`, {});
    return data;
  },

  // Reject editor request (admin)
  rejectEditor: async (userId: string) => {
    const { data } = await apiClient.put(`/users/${userId}/reject`, {});
    return data;
  },

  // Get dashboard statistics (admin)
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get("/users/dashboard/stats");
    return data;
  },

  // Disable user (admin)
  disableUser: async (id: string) => {
    const { data } = await apiClient.put(`/users/${id}/disable`, {});
    return data;
  },

  // Enable user (admin)
  enableUser: async (id: string) => {
    const { data } = await apiClient.put(`/users/${id}/enable`, {});
    return data;
  },

  // Change user role (super_admin)
  changeUserRole: async (id: string, newRole: string) => {
    const { data } = await apiClient.put(`/users/${id}/role`, {
      role: newRole,
    });
    return data;
  },
};

export default userService;

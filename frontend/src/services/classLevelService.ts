import apiClient from "./api";

export interface ClassLevel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const classLevelService = {
  // Get all class levels
  getAllClassLevels: async () => {
    const { data } = await apiClient.get("/class-levels");
    return data;
  },

  // Create class level (admin only)
  createClassLevel: async (
    classLevelData: Omit<ClassLevel, "id" | "createdAt" | "updatedAt">,
  ) => {
    const { data } = await apiClient.post("/class-levels", classLevelData);
    return data;
  },

  // Update class level (admin only)
  updateClassLevel: async (id: string, classLevelData: Partial<ClassLevel>) => {
    const { data } = await apiClient.put(`/class-levels/${id}`, classLevelData);
    return data;
  },

  // Delete class level (admin only)
  deleteClassLevel: async (id: string) => {
    const { data } = await apiClient.delete(`/class-levels/${id}`);
    return data;
  },
};

export default classLevelService;

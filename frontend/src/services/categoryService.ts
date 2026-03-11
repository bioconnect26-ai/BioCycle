import apiClient from "./api";

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order?: number;
  cycleCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    const { data } = await apiClient.get("/categories");
    return data;
  },

  // Get category by ID
  getCategoryById: async (id: string) => {
    const { data } = await apiClient.get(`/categories/${id}`);
    return data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/categories/slug/${slug}`);
    return data;
  },

  // Create category (admin+)
  createCategory: async (categoryData: Category) => {
    const { data } = await apiClient.post("/categories", categoryData);
    return data;
  },

  // Update category (admin+)
  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const { data } = await apiClient.put(`/categories/${id}`, categoryData);
    return data;
  },

  // Delete category (admin)
  deleteCategory: async (id: string) => {
    const { data } = await apiClient.delete(`/categories/${id}`);
    return data;
  },

  // Get cycles by category
  getCyclesByCategory: async (categoryId: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    const { data } = await apiClient.get(
      `/categories/${categoryId}/cycles?${params}`,
    );
    return data;
  },
};

export default categoryService;

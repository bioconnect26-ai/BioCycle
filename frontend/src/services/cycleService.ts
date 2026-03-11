import apiClient from "./api";
import { ElementType } from "react";
import {
  Atom,
  Brain,
  Droplets,
  Flame,
  Leaf,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";

export interface CycleStep {
  id?: string;
  title: string;
  description: string;
  detail: string;
  memoryTrick?: string;
}

export interface QuickFact {
  id?: string;
  label: string;
  value: string;
}

export interface ClassLevel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CycleData {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: string;
  classLevelId: string;
  classLevel?: ClassLevel;
  videoUrl?: string;
  coverImage?: string;
  tags?: string[];
  icon?: ElementType | string;
  color?: string;
  status?: "draft" | "pending_review" | "published";
  steps: CycleStep[];
  quickFacts: QuickFact[];
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  creator?: any;
  updater?: any;
}

const iconMap: Record<string, ElementType> = {
  atom: Atom,
  brain: Brain,
  droplets: Droplets,
  flame: Flame,
  leaf: Leaf,
  sparkles: Sparkles,
  wind: Wind,
  zap: Zap,
};

const resolveIcon = (icon?: string | ElementType) => {
  if (!icon) return Atom;
  if (typeof icon !== "string") return icon;
  return iconMap[icon.toLowerCase()] || Atom;
};

const normalizeCycle = (rawCycle: any): CycleData => {
  const cycle = rawCycle?.cycle || rawCycle;

  return {
    ...cycle,
    category:
      typeof cycle?.category === "string"
        ? cycle.category
        : cycle?.category?.name || "",
    classLevel: cycle?.classLevel,
    tags: Array.isArray(cycle?.tags) ? cycle.tags : [],
    icon: resolveIcon(cycle?.icon),
    color: cycle?.color || undefined,
    steps: Array.isArray(cycle?.steps)
      ? [...cycle.steps].sort(
          (a, b) => (a.stepOrder || 0) - (b.stepOrder || 0),
        )
      : [],
    quickFacts: Array.isArray(cycle?.quickFacts)
      ? [...cycle.quickFacts].sort(
          (a, b) => (a.position || 0) - (b.position || 0),
        )
      : [],
  };
};

export const cycleService = {
  // Get all cycles with filters
  getAllCycles: async (
    page = 1,
    limit = 10,
    filters: Record<string, any> = {},
  ) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value) acc[key] = String(value);
          return acc;
        },
        {} as Record<string, string>,
      ),
    });

    const { data } = await apiClient.get(`/cycles?${params}`);
    return {
      ...data,
      data: Array.isArray(data?.data) ? data.data.map(normalizeCycle) : [],
    };
  },

  // Get cycle by slug (public)
  getCycleBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/cycles/slug/${slug}`);
    const cycle = normalizeCycle(data?.cycle || data);
    return {
      ...data,
      cycle,
      data: cycle,
    };
  },

  // Get cycle by ID
  getCycleById: async (id: string) => {
    const { data } = await apiClient.get(`/cycles/${id}`);
    const cycle = normalizeCycle(data?.cycle || data);
    return {
      ...data,
      cycle,
      data: cycle,
    };
  },

  // Create cycle (editor+)
  createCycle: async (cycleData: CycleData) => {
    const { data } = await apiClient.post("/cycles", cycleData);
    return {
      ...data,
      cycle: data?.cycle ? normalizeCycle(data.cycle) : undefined,
      data: data?.cycle ? normalizeCycle(data.cycle) : undefined,
    };
  },

  // Update cycle
  updateCycle: async (id: string, cycleData: Partial<CycleData>) => {
    const { data } = await apiClient.put(`/cycles/${id}`, cycleData);
    return {
      ...data,
      cycle: data?.cycle ? normalizeCycle(data.cycle) : undefined,
      data: data?.cycle ? normalizeCycle(data.cycle) : undefined,
    };
  },

  // Publish cycle (admin)
  publishCycle: async (id: string) => {
    const { data } = await apiClient.put(`/cycles/${id}/publish`);
    return {
      ...data,
      cycle: data?.cycle ? normalizeCycle(data.cycle) : undefined,
      data: data?.cycle ? normalizeCycle(data.cycle) : undefined,
    };
  },

  // Delete cycle (admin)
  deleteCycle: async (id: string) => {
    const { data } = await apiClient.delete(`/cycles/${id}`);
    return data;
  },
};

export default cycleService;

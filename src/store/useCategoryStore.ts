// src/store/useCategoryStore.ts
import { create } from "zustand";
import { mockCategories } from "@/mocks/mock-categories";
import { getCategories } from "@/services/category.service";
import type { Category } from "@/interfaces/category.interface";

interface CategoryState {
  categories: Category[];
  loadCategories: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loadCategories: async () => {
    const data = await getCategories();
    set({ categories: data });
  },
}));
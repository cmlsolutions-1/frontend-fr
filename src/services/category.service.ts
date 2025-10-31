// src/services/category.service.ts
import { mockCategories } from "@/mocks/mock-categories";
import type { Category } from "@/interfaces/category.interface";

const API_URL = import.meta.env.VITE_API_URL; // Cambia esto por la URL real del backend

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/category/category`);
    
    if (!response.ok) {

      return mockCategories;
    }

    const data = await response.json();
    return data.items || mockCategories;
  } catch (error) {

    return mockCategories;
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const response = await fetch(`${API_URL}/category/subcategories/${id}`);
    
    if (!response.ok) {
      throw new Error("Categoría no encontrada");
    }

    return await response.json();
  } catch (error) {

    return null;
  }
};
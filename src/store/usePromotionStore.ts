//src/store/usePromotionStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Promotion } from "@/interfaces/promotion.interface";
import {
  getPromotions,
  createPromotion as createPromotionService,
  updatePromotion as updatePromotionService,
  deletePromotion as deletePromotionService,
} from "@/services/promotions.service";

interface PromotionState {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;

  // Acciones
  loadPromotions: () => Promise<void>;
  addPromotion: (promotion: Omit<Promotion, "id">) => void;
  updatePromotion: (id: string, promotion: Partial<Promotion>) => void;
  deletePromotion: (id: string) => Promise<void>;
  //removePromotion: (id: string) => Promise<void>;
}


export const usePromotionStore = create<PromotionState>()(
  persist(
    (set) => ({
      promotions: [],
      loading: false,
      error: null,

      loadPromotions: async () => {
        set({ loading: true, error: null });
        try {
          const rawPromotions = await getPromotions(); // Esto es un array de promociones sin tipar
          
          // Normalizamos: aseguramos que cada promoción tenga `id` y `products`
          const normalizedPromotions = rawPromotions.map((promo: any) => ({
            ...promo,
            id: promo._id || promo.id, // El backend usa _id
            products: Array.isArray(promo.products) ? promo.products : [], 
          }));

          set({ promotions: normalizedPromotions, loading: false });
        } catch (error) {
          console.error("Error en loadPromotions:", error);
          set({ error: "No se pudieron cargar las promociones", loading: false });
        }
      },

      addPromotion: (promotion: Promotion) => {
        set((state) => ({
          promotions: [...state.promotions, promotion],
        }));
      },

      updatePromotion: (id, updatedPromotion) => {
      set((state) => ({
        promotions: state.promotions.map((promo) =>
          promo.id === id ? { ...promo, ...updatedPromotion } : promo
        ),
      }));
    },

      deletePromotion: async (id) => {
        try {
          await deletePromotionService(id);
          set((state) => ({
            promotions: state.promotions.filter((promo) => promo.id !== id),
          }));
        } catch (error) {
          set({ error: "No se pudo eliminar la promoción" });
        }
      },
    }),
    {
      name: "promotions-storage",
    }
  )
);
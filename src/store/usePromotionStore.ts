//src/store/usePromotionStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Promotion } from "@/interfaces/promotion.interface";
import { mockPromotions } from "@/mocks/mock-promotions";
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

// export const usePromotionStore = create<PromotionState>()(
//   persist(
//     (set) => ({
//       promotions: mockPromotions,
//       addPromotion: (promotionData) =>
//         set((state) => ({
//           promotions: [
//             ...state.promotions,
//             {
//               ...promotionData,
//               id: Date.now().toString(),
//               createdAt: new Date().toISOString().split("T")[0],
//             },
//           ],
//         })),
//       updatePromotion: (id, updatedFields) =>
//         set((state) => ({
//           promotions: state.promotions.map((promo) =>
//             promo.id === id ? { ...promo, ...updatedFields } : promo
//           ),
//         })),
//       deletePromotion: (id) =>
//         set((state) => ({
//           promotions: state.promotions.filter((promo) => promo.id !== id),
//         })),
//     }),
//     {
//       name: "promotions-storage", // nombre de la key en localStorage
//     }
//   )
// );

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set) => ({
      promotions: [],
      loading: false,
      error: null,

      loadPromotions: async () => {
        set({ loading: true });
        try {
          const data = await getPromotions(); // Llama al servicio del backend
          set({ promotions: data.promotions, loading: false });
        } catch (error) {
          set({ error: "No se pudieron cargar las promociones", loading: false });
        }
      },

      addPromotion: async (promotionData) => {
        try {
          const newPromotion = await createPromotionService(promotionData);
          set((state) => ({ promotions: [...state.promotions, newPromotion] }));
        } catch (error) {
          set({ error: "No se pudo crear la promoción" });
        }
      },

      updatePromotion: async (id, updatedFields) => {
        try {
          const updatedPromotion = await updatePromotionService(id, updatedFields);
          set((state) => ({
            promotions: state.promotions.map((promo) =>
              promo.id === id ? updatedPromotion : promo
            ),
          }));
        } catch (error) {
          set({ error: "No se pudo actualizar la promoción" });
        }
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
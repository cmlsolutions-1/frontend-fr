// src/store/useCartStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Promotion } from "@/interfaces/promotion.interface";

interface CartState {
  cart: any[]; // Puedes definir una interfaz específica más adelante
  promotions: Promotion[];
  loading: boolean;

  addToCart: (product: any) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  removeProduct: (productId: string) => void;
  clearCart: () => void;
  setPromotions: (promotions: Promotion[]) => void;

  getSummaryInformation: () => {
    itemsInCart: number;
    subTotal: number;
    tax: number;
    total: number;
  };

  getCartWithOffers: () => {
    cart: any[];
    subTotal: number;
    tax: number;
    total: number;
    discount: number;
    itemsInCart: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      promotions: [],
      loading: false,

      addToCart: (product) => {
        set((state) => {
          const productInCart = state.cart.find((p) => p._id === product._id);
          
          if (productInCart) {
            const updatedCart = state.cart.map((p) =>
              p._id === product._id
                ? { ...p, quantity: productInCart.quantity + 1 }
                : p
            );
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
      },

      updateProductQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          // Si la cantidad es 0 o negativa, remover el producto
          set((state) => ({
            cart: state.cart.filter((p) => p._id !== productId),
          }));
          return;
        }

        set((state) => ({
          cart: state.cart.map((p) =>
            p._id === productId ? { ...p, quantity } : p
          ),
        }));
      },

      removeProduct: (productId) => {
        set((state) => ({
          cart: state.cart.filter((p) => p._id !== productId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      setPromotions: (promotions) => set({ promotions }),

      getSummaryInformation: () => {
        const cart = get().cart;
        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        let subTotal = 0;
        let tax = 0;
        let total = 0;

        cart.forEach((item) => {
          const price = item.price || (item.precios && item.precios[0] && (item.precios[0].valorpos || item.precios[0].valor)) || 0;
          const quantity = item.quantity;

          const itemTax = price * 0.19;
          const itemSubTotal = price - itemTax;
          const itemTotal = price * quantity;

          subTotal += itemSubTotal * quantity;
          tax += itemTax * quantity;
          total += itemTotal;
        });

        return { itemsInCart, subTotal, tax, total };
      },

      getCartWithOffers: () => {
        const { cart, promotions } = get();

        let subTotal = 0;
        let tax = 0;
        let total = 0;
        let discount = 0;

        // Calcular precios sin descuento
        cart.forEach((product) => {
          const price = product.price || (product.precios && product.precios[0] && (product.precios[0].valorpos || product.precios[0].valor)) || 0;
          const quantity = product.quantity;

          const itemTax = price * 0.19;
          const itemSubTotal = price - itemTax;
          const itemTotal = price * quantity;

          subTotal += itemSubTotal * quantity;
          tax += itemTax * quantity;
          total += itemTotal;
        });

        // Calcular descuentos aplicables
        const currentDate = new Date();
        
        promotions.forEach((promotion) => {
          const isActive = promotion.state === "Active" && 
                          new Date(promotion.endDate) >= currentDate;
          
          if (!isActive) return;

          if (promotion.isAll) {
            // Oferta para todos los productos
            discount += total * (promotion.percentage / 100);
          } else {
            // Oferta para productos específicos
            const promotionProductIds = promotion.products.map((p: any) => p._id || p.id);
            
            cart.forEach((item) => {
              if (promotionProductIds.includes(item._id)) {
                if (promotion.typePackage === "inner" || promotion.typePackage === "unidad") {
                  // Oferta por unidad (requiere cantidad mínima)
                  if (item.quantity >= promotion.minimumQuantity) {
                    const price = item.price || (item.precios && item.precios[0] && (item.precios[0].valorpos || item.precios[0].valor)) || 0;
                    const itemTotal = price * item.quantity;
                    discount += itemTotal * (promotion.percentage / 100);
                  }
                } else if (promotion.typePackage === "master") {
                  // Oferta por paquete master
                  const price = item.price || (item.precios && item.precios[0] && (item.precios[0].valorpos || item.precios[0].valor)) || 0;
                  const itemTotal = price * item.quantity;
                  discount += itemTotal * (promotion.percentage / 100);
                }
              }
            });
          }
        });

        // Aplicar descuento al total
        const finalTotal = total - discount;
        const finalTax = finalTotal * 0.19;
        const finalSubTotal = finalTotal - finalTax;

        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);

        return {
          cart,
          subTotal: finalSubTotal,
          tax: finalTax,
          total: finalTotal,
          discount,
          itemsInCart,
        };
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
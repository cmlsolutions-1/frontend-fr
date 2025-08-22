// src/store/useCartStore.ts
import { create } from "zustand";
import {
  getCartItems,
  updateCartItemQuantity as updateCartItemQuantityService,
  removeCartItem as removeCartItemService,
} from "@/services/cart.service";

import type { CartItem } from "@/interfaces/cart.interface";
import { persist } from "zustand/middleware";



interface CartState {
  cart: CartItem[];
  loading: boolean;

  // Acciones
  addToCart: (product: CartItem) => void;
  updateProductQuantity: (product: CartItem, quantity: number) => void;
  removeProduct: (product: CartItem) => void;
  clearCart: () => void;

  // Servicios
  loadCart: () => void;

  getSummaryInformation: () => {
    itemsInCart: number;
    subTotal: number;
    tax: number;
    total: number;
  };
}


//inicia backend
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      loading: false,



      loadCart: async () => {
        set({ loading: true });
        try {
          const data = await getCartItems(); // Tu servicio fetch
          set({ cart: data, loading: false });
        } catch (error) {
          console.warn("Usando carrito local");
          set({ loading: false });
        }
      },

      addToCart: (product) =>
        set((state) => {
          const productInCart = state.cart.find((p) => p.id === product.id);

          if (productInCart) {
            const updatedCart = state.cart.map((p) =>
              p.id === product.id
                ? { ...p, quantity: productInCart.quantity + 1 }
                : p
            );
            return { cart: updatedCart };
          }

          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      updateProductQuantity: async (product: CartItem, quantity: number) => {
        const success = await updateCartItemQuantityService(
          product.id,
          quantity
        );
        if (!success) return;

        set((state) => ({
          cart: state.cart.map((p) =>
            p.id === product.id ? { ...p, quantity } : p
          ),
        }));
      },

      removeProduct: async (product) => {
        const success = await removeCartItemService(product.id);
        if (!success) return;

        set((state) => ({
          cart: state.cart.filter((p) => p.id !== product.id),
        }));
      },

      clearCart: () => set({ cart: [] }),

      

      getSummaryInformation: () => {
        const cart = get().cart;
        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
        const subTotal = itemsInCart > 0
          ? cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
          : 0;
        const tax = subTotal * 0.15;
        const total = subTotal + tax;

        return { itemsInCart, subTotal, tax, total };
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

//termina backend

//src/store/cart/cart-store.ts

import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface State {
  cart: CartProduct[];

  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };

  addProductTocart: (product: CartProduct) => void;
  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;
  clearCart: () => void;
}

// Función para obtener el precio del producto
const getProductPrice = (product: CartProduct): number => {
  if (product.precios && product.precios.length > 0) {
    return product.precios[0].valorpos || product.precios[0].valor || 0;
  }
  return 0;
};

export const useCartStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],

      // Methods
      getTotalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },

      getSummaryInformation: () => {
        const { cart } = get();

        let subTotal = 0;
        let tax = 0;
        let total = 0;

        cart.forEach((product) => {
          const price = getProductPrice(product);
          const quantity = product.quantity;

          const itemTax = price * 0.19;             // IVA unitario
          const itemSubTotal = price - itemTax;     // Precio sin IVA
          const itemTotal = price * quantity;       // Precio con IVA x cantidad

          subTotal += itemSubTotal * quantity;
          tax += itemTax * quantity;
          total += itemTotal;
        });

        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);

        return {
          subTotal,
          tax,
          total,
          itemsInCart,
        };
      },

      addProductTocart: (product: CartProduct) => {
        const { cart } = get();

        // 1. Revisar si el producto existe en el carrito con la talla seleccionada
        const productInCart = cart.some(
          (item) => item._id === product._id 
        );

        if (!productInCart) {
          set({ cart: [...cart, product] });
          return;
        }

        // ✅ Si el producto existe, incrementar la cantidad
        const updatedCartProducts = cart.map((item) => {
          if (item._id === product._id) {
            return { ...item, quantity: item.quantity + product.quantity };
          }

          return item;
        });

        set({ cart: updatedCartProducts });
      },

      updateProductQuantity: (product: CartProduct, quantity: number) => {
        const { cart } = get();

        // No permitir cantidades negativas o cero
        if (quantity <= 0) {
          get().removeProduct(product);
          return;
        }

        const updatedCartProducts = cart.map((item) => {
          if (item._id === product._id ) {
            return { ...item, quantity: quantity };
          }
          return item;
        });

        set({ cart: updatedCartProducts });
      },

      removeProduct: (product: CartProduct) => {
        const { cart } = get();
        const updatedCartProducts = cart.filter(
          (item) => item._id !== product._id
        );

        set({ cart: updatedCartProducts });
      },

      clearCart: () => {
        set({ cart: [] });
      },
    }),

    {
      name: "shopping-cart",
    }
  )
);

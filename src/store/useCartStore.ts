// src/store/useCartStore.ts
import { create } from "zustand";
import {
  getCartItems,
  updateCartItemQuantity as updateCartItemQuantityService,
  removeCartItem as removeCartItemService,
} from "@/services/cart.service";

import type { CartItem } from "@/interfaces/cart.interface";
import { persist } from "zustand/middleware";
import { Promotion } from "@/interfaces/promotion.interface";

interface CartState {
  cart: CartItem[];
  promotions: Promotion[]; // Añadido para ofertas
  loading: boolean;

  // Acciones
  addToCart: (product: CartItem) => void;
  updateProductQuantity: (product: CartItem, quantity: number) => void;
  removeProduct: (product: CartItem) => void;
  clearCart: () => void;
  setPromotions: (promotions: Promotion[]) => void; // Añadido

  // Servicios
  loadCart: () => void;

  getSummaryInformation: () => {
    itemsInCart: number;
    subTotal: number;
    tax: number;
    total: number;
  };

  // Nuevo método para calcular con ofertas
  getCartWithOffers: () => {
    cart: CartItem[];
    subTotal: number;
    tax: number;
    total: number;
    discount: number;
    itemsInCart: number;
  };
}

// Función para obtener el precio del producto
const getProductPrice = (product: CartItem): number => {
  // Ajusta según la estructura real de tu CartItem
  return product.price || (product.precios && product.precios[0] && (product.precios[0].valorpos || product.precios[0].valor)) || 0;
};

//inicia backend
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      promotions: [], // Inicializar promociones
      loading: false,

      loadCart: async () => {
        set({ loading: true });
        try {
          const data = await getCartItems(); // servicio fetch
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

      // Nuevo método para establecer promociones
      setPromotions: (promotions: Promotion[]) => {
        set({ promotions });
      },

      getSummaryInformation: () => {
        const cart = get().cart;
        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
        
        let subTotal = 0;
        let tax = 0;
        let total = 0;

        cart.forEach((item) => {
          const price = getProductPrice(item);
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

      // Nuevo método para calcular con ofertas
      getCartWithOffers: () => {
        const { cart, promotions } = get();

        let subTotal = 0;
        let tax = 0;
        let total = 0;
        let discount = 0;

        // Calcular precios sin descuento
        cart.forEach((product) => {
          const price = getProductPrice(product);
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
          // Verificar que la promoción esté activa
          const isActive = promotion.state === "Activo" && 
                          new Date(promotion.endDate) >= currentDate;
          
          if (!isActive) return;

          if (promotion.isAll) {
            // Oferta para todos los productos
            discount += total * (promotion.percentage / 100);
          } else {
            // Oferta para productos específicos
            const promotionProductIds = promotion.products.map((p: any) => p._id || p.id);
            
            cart.forEach((item) => {
              if (promotionProductIds.includes(item.id || item._id)) {
                if (promotion.typePackage === "inner" || promotion.typePackage === "unidad") {
                  // Oferta por unidad (requiere cantidad mínima)
                  if (item.quantity >= promotion.minimumQuantity) {
                    const price = getProductPrice(item);
                    const itemTotal = price * item.quantity;
                    discount += itemTotal * (promotion.percentage / 100);
                  }
                } else if (promotion.typePackage === "master") {
                  // Oferta por paquete master
                  const price = getProductPrice(item);
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

//termina backend
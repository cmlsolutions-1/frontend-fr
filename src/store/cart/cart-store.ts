//src/store/cart/cart-store.ts

import type { CartProduct } from "@/interfaces";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Promotion } from "@/interfaces/promotion.interface";

interface State {
  cart: CartProduct[];
  promotions: Promotion[];

  getTotalItems: () => number;
  getSummaryInformation: () => {
    subTotal: number;
    tax: number;
    total: number;
    itemsInCart: number;
  };

  // método para obtener información con ofertas
  getCartWithOffers: () => {
    cart: CartProduct[];
    subTotal: number;
    tax: number;
    total: number;
    discount: number;
    itemsInCart: number;
  };

  addProductTocart: (product: CartProduct) => void;
  updateProductQuantity: (product: CartProduct, quantity: number) => void;
  removeProduct: (product: CartProduct) => void;
  clearCart: () => void;

  // Métodos para ofertas
  setPromotions: (promotions: Promotion[]) => void;
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
      promotions: [],

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

      // Nuevo método que calcula precios con ofertas
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
            const promotionProductIds = promotion.products.map((p: any) => p._id);
            
            cart.forEach((item) => {
              if (promotionProductIds.includes(item._id)) {
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

      addProductTocart: (product: CartProduct) => {
        const { cart } = get();

        // 1. Revisar si el producto existe en el carrito
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
          if (item._id === product._id) {
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

      // Nuevo método para establecer promociones
      setPromotions: (promotions: Promotion[]) => {
        set({ promotions });
      },
    }),

    {
      name: "shopping-cart",
    }
  )
);
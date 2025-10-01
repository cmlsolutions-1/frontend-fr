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

          const itemTotalWithTax = price * quantity; // Total con IVA
          const itemSubTotal = itemTotalWithTax / 1.19; // Antes de IVA
          const itemTax = itemTotalWithTax - itemSubTotal; // IVA

          subTotal += itemSubTotal;
          tax += itemTax;
          total += itemTotalWithTax;
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

        // Calcular totales sin descuento
        let totalWithTax = 0;
        let totalSubTotal = 0;
        let totalTax = 0;

        // Calcular precios sin descuento
        cart.forEach((product) => {
          const price = getProductPrice(product);
          const quantity = product.quantity;

          const itemTotalWithTax = price * quantity; // Total con IVA
          const itemSubTotal = itemTotalWithTax / 1.19; // Antes de IVA
          const itemTax = itemTotalWithTax - itemSubTotal; // IVA

          totalSubTotal += itemSubTotal;
          totalTax += itemTax;
          totalWithTax += itemTotalWithTax;
        });

        // Calcular descuentos aplicables POR PRODUCTO
        let totalDiscount = 0;
        const currentDate = new Date();
        
        // Para cada promoción activa
        promotions.forEach((promotion) => {
          // Verificar que la promoción esté activa
          const isActive = promotion.state === "Active" && 
                          new Date(promotion.endDate) >= currentDate;
          
          if (!isActive) return;

          if (promotion.isAll) {
            // Oferta para todos los productos
            totalDiscount += totalSubTotal * (promotion.percentage / 100);
          } else {
            // Oferta para productos específicos
            const promotionProductIds = promotion.products.map((p: any) => p._id);
            
            cart.forEach((item) => {
              if (promotionProductIds.includes(item._id)) {
                const price = getProductPrice(item);
                const quantity = item.quantity;
                
                const itemTotalWithTax = price * quantity; // Total con IVA
                const itemSubTotal = itemTotalWithTax / 1.19; // Antes de IVA
                
                if (promotion.typePackage === "inner" || promotion.typePackage === "unidad") {
                  // Oferta por unidad (requiere cantidad mínima)
                  if (quantity >= promotion.minimumQuantity) {
                    totalDiscount += itemSubTotal * (promotion.percentage / 100);
                  }
                } else if (promotion.typePackage === "master") {
                  // Oferta por paquete master
                  totalDiscount += itemSubTotal * (promotion.percentage / 100);
                }
              }
            });
          }
        });

        // Aplicar descuento al subtotal (antes de IVA)
        const finalSubTotal = totalSubTotal - totalDiscount;

        // Calcular nuevo IVA basado en el subtotal con descuento
        const finalTax = finalSubTotal * 0.19;
        
        // Calcular total final (subtotal con descuento + nuevo IVA)
        const finalTotal = finalSubTotal + finalTax;

        const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);

        return {
          cart,
          subTotal: finalSubTotal,
          tax: finalTax,
          total: finalTotal,
          discount: totalDiscount,
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

        //  Si el producto existe, incrementar la cantidad
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
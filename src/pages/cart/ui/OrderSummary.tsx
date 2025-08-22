//src/pages/cart/ui/OrderSummary.tsx

import { useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { CartProduct } from "@/interfaces";
import { useEffect, useState } from "react";


//ESTO ES CON INTEGRACION AL BACKEND

export const OrderSummary = () => {
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    total: 0,
    itemsInCart: 0,
  });

  const cart = useCartStore((state) => state.cart);

  // ✅ Función para obtener el precio del producto
  const getProductPrice = (product: CartProduct): number => {
    if (product.precios && product.precios.length > 0) {
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  useEffect(() => {
    const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = cart.reduce(
      (acc, item) => acc + getProductPrice(item) * item.quantity, 
      0
    );
    const tax = subTotal * 0.15;
    const total = subTotal + tax;

    setSummary({ itemsInCart, subTotal, tax, total });
  }, [cart]);

  return (
    <div className="grid grid-cols-2">
      <span>No. Productos</span>
      <span className="text-right">
        {summary.itemsInCart === 1 ? "1 artículo" : `${summary.itemsInCart} artículos`}
      </span>

      <span>Subtotal</span>
      <span className="text-right">{currencyFormat(summary.subTotal)}</span>

      <span>Impuestos (15%)</span>
      <span className="text-right">{currencyFormat(summary.tax)}</span>

      <span className="mt-5 text-2xl">Total:</span>
      <span className="mt-5 text-2xl text-right">{currencyFormat(summary.total)}</span>
    </div>
  );
};
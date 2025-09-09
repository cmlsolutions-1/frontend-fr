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

  // Función para obtener el precio del producto
  const getProductPrice = (product: CartProduct): number => {
    if (product.precios && product.precios.length > 0) {
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  useEffect(() => {
  const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);

  let subTotal = 0;
  let tax = 0;
  let total = 0;

  cart.forEach((item) => {
    const price = getProductPrice(item);
    const quantity = item.quantity;

    const itemTax = price * 0.19;              // IVA unitario
    const itemSubTotal = price - itemTax;      // Precio sin IVA
    const itemTotal = price * quantity;        // Precio x cantidad

    subTotal += itemSubTotal * quantity;
    tax += itemTax * quantity;
    total += itemTotal;
  });

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

      <span>Iva (19%)</span>
      <span className="text-right">{currencyFormat(summary.tax)}</span>

      <span className="mt-5 text-2xl">Total:</span>
      <span className="mt-5 text-2xl text-right">{currencyFormat(summary.total)}</span>
    </div>
  );
};
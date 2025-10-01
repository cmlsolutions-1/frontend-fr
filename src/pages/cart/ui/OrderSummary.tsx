//src/pages/cart/ui/OrderSummary.tsx

import { useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { useEffect, useState } from "react";

// ESTO ES CON INTEGRACION AL BACKEND

export const OrderSummary = () => {
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    total: 0,
    discount: 0,
    itemsInCart: 0,
  });

  const getCartWithOffers = useCartStore((state) => state.getCartWithOffers);
  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    const cartSummary = getCartWithOffers();
    setSummary(cartSummary);
  }, [getCartWithOffers, cart]); // Añadir getCartWithOffers como dependencia

  return (
    <div className="grid grid-cols-2">
      <span>No. Productos</span>
      <span className="text-right">
        {summary.itemsInCart === 1 ? "1 artículo" : `${summary.itemsInCart} artículos`}
      </span>

      <span>Subtotal</span>
      <span className="text-right">{currencyFormat(summary.subTotal)}</span>

      {summary.discount > 0 && (
        <>
          <span>Descuento</span>
          <span className="text-right text-red-600">-{currencyFormat(summary.discount)}</span>
        </>
      )}

      <span>Iva (19%)</span>
      <span className="text-right">{currencyFormat(summary.tax)}</span>

      <span className="mt-5 text-2xl">Total:</span>
      <span className="mt-5 text-2xl text-right">{currencyFormat(summary.total)}</span>
    </div>
  );
};
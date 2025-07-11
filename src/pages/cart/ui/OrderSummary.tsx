//src/pages/cart/ui/OrderSummary.tsx

import { useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/* export const OrderSummary = () => {
  const navigate = useNavigate();
  const cart = useCartStore((state) => state.cart);
  const [loaded, setLoaded] = useState(false);
  // const { itemsInCart, subTotal, tax, total } = useCartStore((state) =>
  //   state.getSummaryInformation()
  // );
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    total: 0,
    itemsInCart: 0,
  });

  // esto es sin el backend

  // useEffect(() => {
  //   setLoaded(true);
  // }, []);



  // backend
  useEffect(() => {
    const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subTotal * 0.15;
    const total = subTotal + tax;

    setSummary({ itemsInCart, subTotal, tax, total });
  }, [cart]);
  //backend


  // useEffect(() => {
  //   if (!loaded && itemsInCart === 0) {
  //     navigate("/empty", { replace: true });
  //   }
  // }, [loaded, itemsInCart]);

  useEffect(() => {
    if (!loaded) 
    return;

//   return (
//     <div className="grid grid-cols-2">
//       <span>No. Productos</span>
//       <span className="text-right">
//         {itemsInCart === 1 ? "1 artículo" : `${itemsInCart} artículos`}
//       </span>

//       <span>Subtotal</span>
//       <span className="text-right">{currencyFormat(subTotal)}</span>

//       <span>Impuestos (15%)</span>
//       <span className="text-right">{currencyFormat(tax)}</span>

//       <span className="mt-5 text-2xl">Total:</span>
//       <span className="mt-5 text-2xl text-right">{currencyFormat(total)}</span>
//     </div>
//   );
// };
    const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subTotal * 0.15;
    const total = subTotal + tax;

    setSummary({ itemsInCart, subTotal, tax, total });

    if (itemsInCart === 0) {
      navigate("/empty", { replace: true });
    }
  }, [cart, loaded]);

  if (!loaded) return <p>Loading...</p>;

  const { itemsInCart, subTotal, tax, total } = summary;

  return (
    <div className="grid grid-cols-2 ">
      <span>No. Productos</span>
      <span className="text-right">
        {itemsInCart === 1 ? "1 artículo" : `${itemsInCart} artículos`}
      </span>

      <span>Subtotal</span>
      <span className="text-right">{currencyFormat(subTotal)}</span>

      <span>Impuestos (15%)</span>
      <span className="text-right">{currencyFormat(tax)}</span>

      <span className="mt-5 text-2xl font-medium text-gray-900">Total:</span>
      <span className="mt-5 text-2xl text-right font-medium text-gray-900">{currencyFormat(total)}</span>
    </div>
  );
}; */

//ESTO ES CON INTEGRACION AL BACKEND

export const OrderSummary = () => {
  const [summary, setSummary] = useState({
    subTotal: 0,
    tax: 0,
    total: 0,
    itemsInCart: 0,
  });

  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    const itemsInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
    const subTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
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
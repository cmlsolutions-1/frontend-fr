import { useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const OrderSummary = () => {
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

  useEffect(() => {
    setLoaded(true);
  }, []);

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
    <div className="grid grid-cols-2">
      <span>No. Productos</span>
      <span className="text-right">
        {itemsInCart === 1 ? "1 artículo" : `${itemsInCart} artículos`}
      </span>

      <span>Subtotal</span>
      <span className="text-right">{currencyFormat(subTotal)}</span>

      <span>Impuestos (15%)</span>
      <span className="text-right">{currencyFormat(tax)}</span>

      <span className="mt-5 text-2xl">Total:</span>
      <span className="mt-5 text-2xl text-right">{currencyFormat(total)}</span>
    </div>
  );
};
// src/pages/checkout/ui/PlaceOrder.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { placeOrder } from "@/mocks/placeOrder";
import { useAddressStore, useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { createOrder } from "@/services/checkout.service";

export const PlaceOrder = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const address = useAddressStore((state) => state.address);
  const getSummaryInformation = useCartStore(
    (state) => state.getSummaryInformation
  );
  const { itemsInCart, subTotal, tax, total } = getSummaryInformation();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMessage("");
    console.log("Cart:", cart); // ✅ Verifica que los productos existan
    console.log("Address:", address); // ✅ Verifica que haya dirección
    //console.log("productsToOrder:", productsToOrder); // ✅ Verifica estructura antes de enviar

    if (!address || cart.length === 0) {
      setErrorMessage("El carrito está vacío o falta información de dirección");
      setIsPlacingOrder(false);
      return;
    }

    const productsToOrder = cart.map((product) => ({
      id: product.id,
      productId: product.id,
      quantity: product.quantity,
      price: product.price,
      slug: product.slug,
      title: product.title,
      image: product.image,
    }));

    try {
      const resp = await createOrder(productsToOrder, address);
      console.log("Respuesta de placeOrder:", resp);
      if (!resp.ok) {
        setIsPlacingOrder(false);
        setErrorMessage(resp.message ?? "Error al procesar la orden");
        return;
      }

      clearCart();
      navigate(`/orders/${resp.order.id}`);
    } catch (error) {
      console.error("Error en PlaceOrder:", error);
      setIsPlacingOrder(false);
      setErrorMessage("Ocurrió un error al procesar la orden.");
    }
  };

  if (!loaded) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-7">

      {/* Divider */}
      <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

      <h2 className="mb-2 mt-5 text-2xl font-medium text-gray-900">
        Resumen de orden
      </h2>

      <div className="grid grid-cols-2">
        <span>No. Productos</span>
        <span className="text-right">
          {itemsInCart === 1 ? "1 artículo" : `${itemsInCart} artículos`}
        </span>

        <span>Subtotal</span>
        <span className="text-right">{currencyFormat(subTotal)}</span>

        <span>Impuestos (15%)</span>
        <span className="text-right">{currencyFormat(tax)}</span>

        <span className="mt-5 text-2xl font-medium text-gray-900">Total:</span>
        <span className="mt-5 text-2xl text-right font-medium text-gray-900">
          {currencyFormat(total)}
        </span>
      </div>

      <div className="mt-5 mb-2 w-full">
        <p className="mb-5">
          {/* Disclaimer */}
          <span className="text-xs">
            Al hacer clic en &quot;Colocar orden&quot;, aceptas nuestros{" "}
            <a href="#" className="underline">
              términos y condiciones
            </a>
            y{" "}
            <a href="#" className="underline">
              política de privacidad
            </a>
          </span>
        </p>

        <p className="text-red-500">{errorMessage}</p>
        
        <button
          onClick={onPlaceOrder}
          disabled={isPlacingOrder}
          className={clsx("w-full py-3 px-4 rounded-md", {
            "bg-[#F2B318] text-white hover:bg-[#F4C048]": !isPlacingOrder,
            "bg-gray-300 text-gray-600 cursor-not-allowed": isPlacingOrder,
          })}
        >
          {isPlacingOrder ? "Procesando..." : "Colocar orden"}
        </button>
      </div>
    </div>
  );
};

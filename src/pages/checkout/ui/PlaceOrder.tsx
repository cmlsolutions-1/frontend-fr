// src/pages/checkout/ui/PlaceOrder.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { createOrder } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import { CartProduct } from "@/interfaces";


export const PlaceOrder = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const getSummaryInformation = useCartStore((state) => state.getSummaryInformation);
  const { itemsInCart, subTotal, tax, total } = getSummaryInformation();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  const user = useAuthStore((state) => state.user);


  useEffect(() => {
    setLoaded(true);
  }, []);

  const isClient = user?.role === "Client"; // Solo clientes pueden ordenar

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMessage("");

    // --- Validación inicial ---
    if (!user) {
      setErrorMessage("Debes iniciar sesión para realizar un pedido.");
      setIsPlacingOrder(false);
      return;
    }

    // Verificar que el usuario es cliente
    if (!isClient) {
      setErrorMessage("Tu rol no permite realizar pedidos.");
      setIsPlacingOrder(false);
      return;
    }

    console.log("👤 Usuario completoooo:", user);

    if (cart.length === 0) {
      setErrorMessage("El carrito está vacío.");
      setIsPlacingOrder(false);
      return;
    }

 // Obtener la categoría de precio del cliente (estructura correcta)
    const clientPriceCategory = user.priceCategory; //Aquí está la categoría de precio
    console.log("🏷️ Categoría de precio encontrada:", clientPriceCategory);
    
    if (!clientPriceCategory) {
      setErrorMessage("No se pudo obtener la categoría de precio del cliente.");
      setIsPlacingOrder(false);
      return;
    }


    try {
      // Preparar los items de la orden con la estructura correcta
      const orderItems = cart.map(item => ({
        quantity: item.quantity,
        idProduct: item._id,
        priceCategory: clientPriceCategory
      }));

      // Crear el payload
      const payload = {
        idClient: user._id,
        orderItems: orderItems
      };

      console.log("📦 Payload a enviar:", payload);

      // Crear la orden
      const result = await createOrder(payload);

      if (!result.ok) {
        setErrorMessage(result.message || "Error al crear la orden");
        setIsPlacingOrder(false);
        return;
      }

      // Éxito: Limpiar carrito y redirigir
      clearCart();
      
      // if (result.order && result.order._id) {
      //   // Redirigir según el rol del usuario
      //   const redirectPath = user.role === 'Client' 
      //     ? `/orders/${result.order._id}`
      //     : user.role === 'SalesPerson'
      //     ? `/salesperson/orders/${result.order._id}`
      //     : `/admin/orders/${result.order._id}`;
        
      //   navigate(redirectPath);
      // } else {
      //   // Redirigir a la lista de órdenes si no hay ID específico
      //   const ordersPath = user.role === 'Client' 
      //     ? '/orders'
      //     : user.role === 'SalesPerson'
      //     ? '/salesperson/orders'
      //     : '/admin/orders';
        
      //   navigate(ordersPath);
      // }
      if (result.order && result.order._id) {
        navigate(`/orders/${result.order._id}`);
      } else {
        navigate("/orders");
      }

    } catch (error) {
      console.error("Error al crear orden:", error);
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado");
      setIsPlacingOrder(false);
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

        <span>Iva (19%)</span>
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

        {errorMessage && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8.75-3.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}


        <button
          onClick={onPlaceOrder}
          disabled={!isClient || isPlacingOrder || cart.length === 0}
          className={clsx(
            "w-full py-3 px-4 rounded-md transition-colors duration-200",
            {
              "bg-[#F2B318] text-white hover:bg-[#F4C048]":
                isClient && !isPlacingOrder && cart.length > 0,
              "bg-gray-300 text-gray-600 cursor-not-allowed":
                !isClient || isPlacingOrder || cart.length === 0,
            }
          )}
        >
          {!isClient
            ? "Solo los clientes pueden ordenar"
            : isPlacingOrder
            ? "Procesando..."
            : "Colocar orden"}
        </button>
      </div>
    </div>
  );
};

// src/pages/checkout/ui/PlaceOrder.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useAddressStore, useCartStore } from "@/store";
import { currencyFormat } from "@/utils";
import { createOrder, CreateOrderPayload, OrderProductItem } from "@/services/checkout.service";
import { useAuthStore } from "@/store/auth-store";


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

  const user = useAuthStore((state) => state.user);  // --- Obtener el usuario logueado desde el store de Zustand ---

  useEffect(() => {
    setLoaded(true);
  }, []);

  const onPlaceOrder = async () => {
    setIsPlacingOrder(true);
    setErrorMessage("");

    // --- Validación inicial ---
    if (!user) {
      setErrorMessage("Debes iniciar sesión para realizar un pedido.");
      setIsPlacingOrder(false);
      return;
    }

    const clientId = user._id;
    console.log("Usuario logueado (desde store):", user); // Para depuración


    if (!clientId) {
      setErrorMessage("No se pudo identificar al cliente.");
      setIsPlacingOrder(false);
      return;
    }

    if (cart.length === 0) {
      setErrorMessage("El carrito está vacío.");
      setIsPlacingOrder(false);
      return;
    }

    console.log("Cart:", cart); // ✅ Verifica que los productos existan
    console.log("Address:", address); // ✅ Verifica que haya dirección
    //console.log("productsToOrder:", productsToOrder); // ✅ Verifica estructura antes de enviar

    if (!address || cart.length === 0) {
      setErrorMessage("El carrito está vacío o falta información de dirección");
      setIsPlacingOrder(false);
      return;
    }

    // --- 1. Obtener priceCategory del cliente logueado ---
    
    const clientPriceCategory = user?.priceCategory; 

    if (!clientPriceCategory) {
      setErrorMessage("No se pudo obtener la categoría de precio del cliente.");
      setIsPlacingOrder(false);
      return; // Detener el proceso si no hay priceCategory
    }

      console.log("Cart:", cart);
      console.log("Address:", address);
      console.log("Client ID (usado para la orden):", clientId);
      console.log("Client Price Category (usada para todos los items):", clientPriceCategory);

    const productsToOrder: OrderProductItem[] = cart.map(item => {
      const reference = item.reference; // Ajusta según tu estructura
      const quantity = item.quantity;

      // Validaciones básicas por item (opcional pero recomendado)
      if (!reference || quantity == null || quantity <= 0) {
         console.error("Item del carrito inválido (faltan datos):", item);
         
      }
      return {
        // productId: item.id, // Si el backend lo requiere
        reference: item.reference, // Asegúrate de que 'item' tenga 'reference'
        priceCategory: clientPriceCategory,  // Asegúrate de que 'item' tenga 'priceCategory'
        quantity: item.quantity, // Asegúrate de que 'item' tenga 'quantity'
        // ...otros campos si OrderProductItem los requiere
      };
    // Filtrar items inválidos si es necesario
    }).filter(item => item.reference && item.priceCategory && item.quantity > 0); 

    // --- 3. Validar que todos los items sean válidos después del mapeo ---
    const hasInvalidItems = productsToOrder.some(
      item => !item.reference || !item.priceCategory || item.quantity <= 0
    );
  if (hasInvalidItems) {
    setErrorMessage("Algunos productos en el carrito tienen datos incompletos. Por favor, revísalos.");
    setIsPlacingOrder(false);
    return;
}
    // Validar que se haya creado al menos un item válido
    if (productsToOrder.length === 0 || productsToOrder.length !== cart.length) {
        setErrorMessage("No hay productos válidos en el carrito para procesar.");
        setIsPlacingOrder(false);
        return;
    }
    console.log("productsToOrder:", productsToOrder);

    // --- Crear el payload ---
    const orderPayload: CreateOrderPayload = {
      clientId: clientId,
      productsToOrder: productsToOrder,
      // address: address // Si decides incluirlo aquí, descomenta
    };

    try {
      const resp = await createOrder(orderPayload);
      console.log("Respuesta de placeOrder:", resp);

      if (!resp.ok) {
        setIsPlacingOrder(false);
        setErrorMessage(resp.message ?? "Error al procesar la orden en el servidor.");
        return;
      }

// --- Éxito: Limpiar carrito y redirigir ---
      clearCart();
      // Asegúrate de que resp.order.id exista. Ajusta según la respuesta real.
      if (resp.order && resp.order.id) {
         navigate(`/orders/${resp.order.id}`);
      } else {
         // Si no hay ID, podrías redirigir a una página de éxito genérica
         console.warn("Respuesta de orden no incluye ID:", resp.order);
         navigate(`/orders/success`); // Ejemplo de ruta genérica
      }

    } catch (error) {
      console.error("Error en PlaceOrder al llamar al servicio:", error);
      setIsPlacingOrder(false);
      // Mensaje de error genérico o específico si el error tiene uno
      setErrorMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado al procesar la orden.");
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

        {/* Mostrar mensaje de error */}
        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
        
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

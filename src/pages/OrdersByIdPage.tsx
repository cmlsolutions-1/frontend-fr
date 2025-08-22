//src/pages/OrdersByIdPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "@/services/orders.service";
import { currencyFormat } from "@/utils";
import { OrderStatus, Title } from "@/components";
import { OrderStatusButton } from "@/components/orders/OrderStatusButton";
import { useAuthStore } from '@/store/auth-store';

export default function OrdersByIdPage() {
  const { _id } = useParams<{ _id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // ✅ Función para determinar la ruta de vuelta según el rol
  const getBackRoute = () => {
    if (!user) return '/orders';
    
    switch (user.role) {
      case 'Client':
        return '/orders';
      case 'SalesPerson':
        return '/salesPerson/orders'; // ✅ Ajusta esta ruta según tu configuración
      case 'Admin':
        return '/admin/orders'; // ✅ Ajusta esta ruta según tu configuración
      default:
        return '/orders';
    }
  };

  const backRoute = getBackRoute();
  console.log("🔙 Ruta de vuelta:", backRoute);

  // ✅ Debug para ver qué ID se está recibiendo
  console.log("🔍 useParams id:", _id);
  console.log("🔍 typeof id:", typeof _id);
  
  useEffect(() => {
    console.log("🔄 useEffect ejecutado con id:", _id);

    if (!_id || _id === 'undefined' || _id === 'null') {
      console.error("❌ ID no válido:", _id);
      setError("ID de orden no válido");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true); // ✅ Iniciar carga
        setError(null); // ✅ Limpiar errores previos
        
        console.log("🚀 Solicitando orden con ID:", _id);
        const { ok, order } = await getOrderById(_id);
        if (!ok || !order) {
          setError("Orden no encontrada");
          return;
        }
        console.log("✅ Orden cargada:", order);
        
        setOrder(order);
      } catch (error) {
        console.error("No se pudo cargar la orden", error);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false); // ✅ Finalizar carga
      }
    };

    loadOrder();
  }, [_id, navigate]);

  // ✅ Manejar estados de loading y error
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-lg">Cargando detalles de la orden...</p>
        <p className="text-sm text-gray-500">ID: {_id || 'undefined'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500 text-lg">{error}</p>
        <p className="text-sm text-gray-500">ID recibido: {_id || 'undefined'}</p>
        <Link 
          to={backRoute} 
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
        >
          Volver a órdenes
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-500">No se encontró la orden solicitada.</p>
        <p className="text-sm text-gray-500">ID: {_id || 'undefined'}</p>
        <Link 
          to={backRoute} 
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
        >
          Volver a órdenes
        </Link>
      </div>
    );
  }

  // Calcular totales en base a los items
  const itemsInOrder = order.items?.length || 0;
  const subTotal = order.items?.reduce(
    (acc: number, item: any) => acc + (item.price || item.Product?.valorpos || 0) * item.quantity,
    0
  ) || 0;
  const tax = subTotal * 0.15;
  const total = subTotal + tax;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-full max-w-6xl">
        <Title title={`Orden #${order._id?.slice(-6) || 'N/A'}`} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <OrderStatus isPaid={order.isPaid} />

            {order.items?.map((item: any, index: number) => (
              <div key={item._id || index} className="flex mb-5 p-4 border rounded-lg">
                <div className="mr-5 w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-gray-500 text-xs">IMG</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {item.Product?.description || item.Product?.detalle || "Producto sin detalle"}
                  </p>
                  <p className="text-gray-600">
                    ${(item.price || item.Product?.valorpos || 0).toLocaleString()} x {item.quantity}
                  </p>
                  <p className="font-bold text-gray-900">
                    Subtotal: {currencyFormat((item.price || item.Product?.valorpos || 0) * item.quantity)}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500">No hay productos en esta orden.</p>
            )}
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-2xl font-bold mb-2">Resumen de orden</h2>
            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <div className="grid grid-cols-2 gap-3">
              <span className="text-gray-600">No. Productos</span>
              <span className="text-right font-medium">
                {itemsInOrder === 1 ? "1 artículo" : `${itemsInOrder} artículos`}
              </span>

              <span className="text-gray-600">Subtotal</span>
              <span className="text-right font-medium">{currencyFormat(subTotal)}</span>

              <span className="text-gray-600">Impuestos (15%)</span>
              <span className="text-right font-medium">{currencyFormat(tax)}</span>

              <span className="mt-5 text-2xl font-bold text-gray-900">
                Total:
              </span>
              <span className="mt-5 text-2xl font-bold text-gray-900 text-right">
                {currencyFormat(total)}
              </span>
            </div>

            {/* Botón de estado */}
            <div className="mt-8">
              <OrderStatusButton
                orderId={order._id}
                initialIsPaid={order.isPaid}
                onStatusChange={(newIsPaid) => {
                  setOrder((prevOrder: any) => ({
                    ...prevOrder,
                    isPaid: newIsPaid,
                  }));
                }}
              />
            </div>

            <Link
              to={backRoute}
              className="mt-6 btn-primary w-full block text-center text-sm font-light px-6 py-3 text-blue-600 hover:text-blue-800 underline border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              ← Volver a órdenes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
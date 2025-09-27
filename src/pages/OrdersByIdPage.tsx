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


  // Función para determinar la ruta de vuelta según el rol
  const getBackRoute = () => {
    if (!user) return '/orders';
    
    switch (user.role) {
      case 'Client':
        return '/orders';
      case 'SalesPerson':
        return '/salesPerson/orders'; 
      case 'Admin':
        return '/admin/orders';
      default:
        return '/orders';
    }
  };

  const backRoute = getBackRoute();
  console.log("Ruta de vuelta:", backRoute);

  // Debug para ver qué ID se está recibiendo
  console.log("useParams id:", _id);
  console.log("typeof id:", typeof _id);
  
  useEffect(() => {
    console.log("useEffect ejecutado con id:", _id);

    if (!_id || _id === 'undefined' || _id === 'null') {
      console.error("ID no válido:", _id);
      setError("ID de orden no válido");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true); // Iniciar carga
        setError(null); // Limpiar errores previos
        
        console.log("🚀 Solicitando orden con ID:", _id);
        const { ok, order } = await getOrderById(_id);
        if (!ok || !order) {
          setError("Orden no encontrada");
          return;
        }
        console.log("Orden cargada:", order);
        
        setOrder(order);
      } catch (error) {
        console.error("No se pudo cargar la orden", error);
        setError("Error al cargar la orden");
      } finally {
        setLoading(false); // Finalizar carga
      }
    };
    

    loadOrder();
  }, [_id, navigate]);

  // Manejar estados de loading y error
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
  const subTotal = order.subTotal || 0;
  const tax = order.tax || 0;
  const total = order.total || 0;
  const discount = order.discounts || 0;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-full max-w-6xl">
        <Title title={`Orden #${order._id?.slice(-6) || 'N/A'}`} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <OrderStatus isPaid={order.isPaid} />

            {order.items?.length > 0 ? (
              order.items.map((item: any, index: number) => {
                // Extraer la URL de la imagen
                const imageUrl = item.Product?.image?.url?.trim();
                const hasValidImage = imageUrl && !imageUrl.includes('undefined');
                const fallbackImage = "/images/no-image.jpg";
            
            return (
              
              <div key={item._id || index} className="flex mb-5 p-4 border rounded-lg">

                {/* Imagen */}
                <div className="mr-5 w-24 h-24 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                      <img
                        src={hasValidImage ? imageUrl : fallbackImage}
                        alt={item.Product?.description || "Producto sin imagen"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                    </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {item.Product?.description || item.Product?.detalle || "Producto sin detalle"}
                  </p>
                  <p className="text-gray-600">
                    ${(item.price || item.Product?.valorpos || 0).toLocaleString()} x {item.quantity}
                  </p>
                  <p className="font-bold text-gray-900">
                    Ref: {item.Product?.reference}
                  </p>
                  <p className="font-bold text-gray-900">
                    Subtotal: {currencyFormat((item.price || item.Product?.valorpos || 0) * item.quantity)}
                  </p>
                </div>
              </div>
            )
          }) 
        ) : (
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

              {/* Mostrar descuento si existe */}
              {discount > 0 && (
                <>
                  <span className="text-gray-600">Descuento</span>
                  <span className="text-right font-medium text-red-600">-{currencyFormat(discount)}</span>
                </>
              )}


              <span className="text-gray-600">Iva (19%)</span>
              <span className="text-right font-medium">{currencyFormat(tax)}</span>



              <span className="mt-5 text-2xl font-bold text-gray-900">
                Total:
              </span>
              <span className="mt-5 text-2xl font-bold text-gray-900 text-right">
                {currencyFormat(total)}
              </span>
            </div>

            {/* Mostrar información de ofertas si existen */}
            {order.offers && order.offers.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Ofertas aplicadas:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {order.offers.map((offer: any, index: number) => (
                    <li key={index} className="text-sm text-blue-700">
                      <span className="font-medium">{offer.name}</span> - {offer.percentage}% de descuento
                      {offer.typePackage === 'inner' && ` (mínimo ${offer.minimumQuantity} unidades)`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
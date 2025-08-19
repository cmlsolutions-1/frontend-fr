//src/pages/OrdersByIdPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "@/services/orders.service";

import { getMockOrderById } from "@/mocks/get-mock-order-by-id";
import { currencyFormat } from "@/utils";
import { OrderStatus, Title } from "@/components";
import { OrderStatusButton } from "@/components/orders/OrderStatusButton";

export default function OrdersByIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);

  
  
  useEffect(() => {
    if (!id) return;

    const loadOrder = async () => {
      try {
        const { ok, order } = await getOrderById(id);
        if (!ok || !order) {
          navigate("/orders");
          return;
        }
        setOrder(order);
      } catch (error) {
        console.error("No se pudo cargar la orden", error);
      }
    };

    loadOrder();
  }, [id, navigate]);

  if (!order) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Cargando detalles de la orden...</p>
      </div>
    );
  }

  // Calcular totales en base a los items
  const itemsInOrder = order.items?.length || 0;
  const subTotal = order.items?.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0
  ) || 0;
  const tax = subTotal * 0.15;
  const total = subTotal + tax;

  //const address = order.OrderAddress;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden #${order._id.slice(-6)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <OrderStatus isPaid={order.isPaid} />

            {order.items.map((item: any) => (
              <div key={item._id} className="flex mb-5">
                <div className="mr-5 w-[100px] h-[100px] flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-gray-500 text-xs">IMG</span>
                </div>
                <div>
                  <p className="font-semibold">
                    {item.idProduct?.detalle || "Producto sin detalle"}
                  </p>
                  <p>
                    ${item.price} x {item.quantity}
                  </p>
                  <p className="font-bold">
                    Subtotal: {currencyFormat(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            )
            )}

          </div>

          {/* Checkout */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Resumen de orden</h2>
            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <div className="grid grid-cols-2">
              <span>No. Productos</span>
              <span className="text-right">
                {itemsInOrder === 1 ? "1 artículo" : `${itemsInOrder} artículos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">{currencyFormat(subTotal)}</span>

              <span>Impuestos (15%)</span>
              <span className="text-right">{currencyFormat(tax)}</span>

              <span className="mt-5 text-2xl font-medium text-gray-900">
                Total:
              </span>
              <span className="mt-5 text-2xl font-medium text-gray-900 text-right">
                {currencyFormat(total)}
              </span>
            </div>

            {/* Botón de estado */}
            <div className="w-full py-3 px-4 rounded-md">
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
              to="/orders"
              className="btn-primary w-full block text-center text-sm font-light px-6 mx-2 text-blue-600 hover:text-blue-800 underline"
            >
              Volver a órdenes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
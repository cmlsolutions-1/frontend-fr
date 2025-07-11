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

  //MOCK INABILITAR CON EL BACKEND Y ACTIVAR EL OTRO-----------------------------------
  useEffect(() => {
    if (!id) return;

    getMockOrderById(id).then(({ ok, order }) => {
      if (!ok || !order) {
        navigate("/");
        return;
      }
      setOrder(order);
    });
  }, [id, navigate]);

  //TERMINA EL MOCK----------------------------------------------------------------

  //BACKEND ACTIVAR--------------------------------------
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { ok, order } = await getOrderById(id);
        if (ok && order) {
          setOrder(order);
        }
      } catch (error) {
        console.error("No se pudo cargar la orden");
      }
    };

    loadOrder();
  }, [id]);

  //TERMINA-------------------------------------------------

  if (!order) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>Cargando detalles de la orden...</p>
      </div>
    );
  }

  //const address = order.OrderAddress;

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <OrderStatus isPaid={order.isPaid} />

            {order.OrderItem.map((item: any) => (
              <div key={item.product.slug + "-"} className="flex mb-5">
                <img
                  src={`/products/${item.product.ProductImage[0].url}`}
                  width={100}
                  height={100}
                  style={{ width: "100px", height: "100px" }}
                  alt={item.product.title}
                  className="mr-5 rounded"
                />
                <div>
                  <p>{item.product.title}</p>
                  <p>
                    ${item.price} x {item.quantity}
                  </p>
                  <p className="font-bold">
                    Subtotal: {currencyFormat(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout */}
          <div className="bg-white rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            {/* <div className="mb-10">
              <p className="text-xl">
                {address.firstName} {address.lastName}
              </p>
              <p>{address.address}</p>
              <p>{address.address2}</p>
              <p>{address.postalCode}</p>
              <p>{address.city}, {address.countryId}</p>
              <p>{address.phone}</p>
            </div> */}

            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <h2 className="mb-2 mt-5 text-2xl font-medium text-gray-900">
              Resumen de orden
            </h2>
            <div className="grid grid-cols-2">
              <span>No. Productos</span>
              <span className="text-right">
                {order.itemsInOrder === 1
                  ? "1 artículo"
                  : `${order.itemsInOrder} artículos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">
                {currencyFormat(order.subTotal)}
              </span>

              <span>Impuestos (15%)</span>
              <span className="text-right">{currencyFormat(order.tax)}</span>

              <span className="mt-5 text-2xl font-medium text-gray-900">
                Total:
              </span>
              <span className="mt-5 text-2xl font-medium text-gray-900 text-right">
                {currencyFormat(order.total)}
              </span>
            </div>

            {/* <div className="mt-5 mb-2 w-full">
                <OrderStatus isPaid />

            </div> */}

            {/* Botón de estado */}
            <div className="w-full py-3 px-4 rounded-md">
              {/* <OrderStatusButton orderId={order.id} initialIsPaid={order.isPaid} /> */}
              <OrderStatusButton
                orderId={order.id}
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
              Volver a ordenes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

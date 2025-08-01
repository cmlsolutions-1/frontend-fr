//src/pages/OrdersPage.tsx

import { useEffect, useState } from "react";
import { getMockOrdersByUser } from "@/mocks/getMockOrdersByUser";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import type { Order } from "@/interfaces/order.interface";
import { OrderPDFButton } from '@/components/orders/OrderPDFButton';
import { OrderStatusButton } from '@/components/orders/OrderStatusButton';
import { getOrdersByUser } from "@/services/orders.service";

export default function OrdersPage() {
  //QUITAR CUANDO SE HABILITE EL BACKEND
  // const [orders, setOrders] = useState<Order[]>([]);
  // const navigate = useNavigate();

  // ACTIVAR BAKEND 
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  //ESTO ES MOCKS QUITAR CUANDO SE HABILITE EL BACKEND
  // useEffect(() => {
  //   getMockOrdersByUser().then(({ ok, orders }) => {
  //     if (!ok) {
  //       navigate("/auth/login");
  //       return;
  //     }
  //     setOrders(orders || []);
  //   });
  // }, [navigate]);

  //BACKEND
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrdersByUser();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error al traer órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) return <p>Cargando órdenes...</p>;

  //TERMINA BACKEND

  return (
    <div className="px-4 sm:px-8 py-4">
      <h2 className="text-xl font-bold mb-4">Historial Pedidos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Nro. Pedido
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Nombre Cliente
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Opciones
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-gray-100 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.id.split("-").at(-1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  Carlos Pérez
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <div className="flex items-center">
                <IoCardOutline
                  className={order.isPaid ? "text-green-700" : "text-red-700"}
                />
                <span
                  className={`ml-2 font-medium ${
                    order.isPaid ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {order.isPaid ? "Gestionada" : "No Gestionada"}
                </span>
              </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 underline">
              <Link to={`/orders/${order.id}`} className="hover:underline">
                Ver orden
              </Link>
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <IoDownloadOutline />
                <OrderPDFButton order={order} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
}

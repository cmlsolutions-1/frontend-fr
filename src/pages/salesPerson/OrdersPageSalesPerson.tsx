//src/pages/salesPerson/OrdersPageSalesPerson.tsx

import { useEffect, useState } from "react";
import { getMockOrdersByUser } from "@/mocks/getMockOrdersByUser";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import type { Order } from "@/interfaces/order.interface";
import { OrderPDFButton } from "@/components/orders/OrderPDFButton";
import { OrderStatusButton } from "@/components/orders/OrderStatusButton";
import { useAuthStore } from "@/store/auth-store";
import { getOrdersBySalesPerson } from "@/services/orders.service";

import { Home } from "lucide-react";

export default function OrdersPageSalesPerson() {
  // ACTIVAR BAKEND
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const { user } = useAuthStore();

  //BACKEND
  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!user || user.role !== "SalesPerson") {
          setOrders([]);
          return;
        }

        const result = await getOrdersBySalesPerson(user._id);

        if (result.ok) {
          setOrders(result.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-4 mt-[100px]">
        <p>Cargando órdenes...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-4 mt-[120px] space-y-4">
      {/* Título principal */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Pedidos Clientes
      </h1>
      {/* Subtitle + botón en la misma fila */}
      <div className="flex items-center justify-between">
        <p className="text-base md:text-lg text-gray-600">
          Revisa los pedidos de tus clientes y descarga el PDF cuando lo
          necesites
        </p>

        <button
          onClick={() => navigate("/homePage")}
          className="
            flex items-center gap-2
            text-sm font-semibold
            text-gray-600 hover:text-[#F4C048]
            transition
          "
        >
          <Home className="w-4 h-4" />
          Inicio
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Nro. Pedido
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Nombre Cliente
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Pedido Syscafe
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Observaciones
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
                  {order.orderNumber || order._id?.slice(-6) || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {/* --- CAMBIO AQUÍ --- */}
                  {order.Client && order.Client.name && order.Client.lastName
                    ? `${order.Client.name} ${order.Client.lastName}`
                    : order.Client &&
                      (order.Client.name || order.Client.lastName)
                    ? order.Client.name || order.Client.lastName
                    : "Cliente no encontrado"}
                  {/* --- FIN CAMBIO --- */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.syscafeOrder || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center">
                    <IoCardOutline
                      className={
                        order.isPaid ? "text-green-700" : "text-red-700"
                      }
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

                {/* Observaciones */}
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                  {order.addres?.trim() ? (
                    <span className="block truncate" title={order.addres}>
                      {order.addres}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 underline">
                  <Link to={`/orders/${order._id}`} className="hover:underline">
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

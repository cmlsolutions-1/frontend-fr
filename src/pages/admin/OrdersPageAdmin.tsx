//src/pages/admin/OrdersPageAdmin.tsx

import { useEffect, useState } from "react";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import { OrderPDFButton } from '@/components/orders/OrderPDFButton';
import { getOrdersByUser } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import type { Order } from "@/interfaces/order.interface";

export default function OrdersPageAdmin() {


  // ACTIVAR BAKEND 
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();


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
    <div className="px-4 sm:px-8 py-4 mt-[100px]">
      <h2 className="text-xl font-bold mb-4">Lista de Pedidos Clientes</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          {/*Esta el la cabecera */}
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Nro. Pedido
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Nombre Cliente
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Opciones
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b hover:bg-[#f4c04827] transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order._id.slice(-6)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user?.name && user?.lastName 
                    ? `${user.name} ${user.lastName}` 
                    : user?.name || user?.lastName || "Sin Nombre"}
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

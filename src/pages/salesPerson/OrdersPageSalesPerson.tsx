//src/pages/salesPerson/OrdersPageSalesPerson.tsx

import { useEffect, useState } from "react";
import { getMockOrdersByUser } from "@/mocks/getMockOrdersByUser";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import type { Order } from "@/interfaces/order.interface";
import { OrderPDFButton } from '@/components/orders/OrderPDFButton';
import { OrderStatusButton } from '@/components/orders/OrderStatusButton';
import { useAuthStore } from "@/store/auth-store";
import { getOrdersBySalesPerson } from "@/services/orders.service";

export default function OrdersPageSalesPerson() {


  // ACTIVAR BAKEND 
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();



  //BACKEND
  useEffect(() => {
      const loadOrders = async () => {
        try {
          console.log("👤 Usuario actual:", user); // Debug
  
          if (!user || user.role !== 'SalesPerson') {
            console.error('Usuario no válido o rol incorrecto');
            setOrders([]);
            return;
          }
          // ✅ Asegúrate de pasar solo el _id como string
          console.log("🆔 ID del vendedor:", user._id); // Debug
  
          const result = await getOrdersBySalesPerson(user._id);
          
          if (result.ok) {
            console.log("📋 Órdenes cargadas:", result.orders); // Debug
            setOrders(result.orders);
          } else {
            console.error('No se pudieron cargar las órdenes del cliente');
            setOrders([]);
          }
        } catch (error) {
          console.error("Error al traer órdenes:", error);
          setOrders([]);
        } finally {
          setLoading(false);
        }
      };
  
      loadOrders();
    }, [user]);

  if (loading) return <p>Cargando órdenes...</p>;

  //TERMINA BACKEND

  return (
    <div className="px-4 sm:px-8 py-4">
      <h2 className="text-xl font-bold mb-4">Pedidos Clientes</h2>

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

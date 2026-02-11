//src/pages/OrdersPage.tsx

import { useEffect, useState } from "react";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import type { Order } from "@/interfaces/order.interface";
import { OrderPDFButton } from '@/components/orders/OrderPDFButton';
import { OrderStatusButton } from '@/components/orders/OrderStatusButton';
import { getOrdersByClient } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import type { Cliente } from "@/interfaces/user.interface";

export default function OrdersPage() {


  // ACTIVAR BAKEND 
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  



  //BACKEND
  useEffect(() => {
    const loadOrders = async () => {
      try {


        if (!user || user.role !== 'Client') {

          setOrders([]);
          return;
        }
        // Asegúrate de pasar solo el _id como string


        const result = await getOrdersByClient(user._id);
        
        if (result.ok) {


          // Aca agramos el cliente y vendedor a cada orden
          const enrichedOrders = result.orders.map((o: any) => ({
            ...o,
            idClient: user?._id,                  // del usuario logueado
            clientName: `${user?.name || ""} ${user?.lastName || ""}`.trim() || "Cliente N/A",
            idSalesPerson: user?.salesPerson || null // si viene en el user
          }));

          setOrders(enrichedOrders);
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

  if (loading) return <p>Cargando órdenes...</p>;

  //TERMINA BACKEND

  return (
    <div className="px-4 sm:px-8 py-4 mt-[100px]">
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
                Pedido Syscafe
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
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
                key={order._id}
                className="border-b hover:bg-gray-100 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                {order.orderNumber || order._id?.slice(-6) || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user?.name && user?.lastName 
                    ? `${user.name} ${user.lastName}` 
                    : user?.name || user?.lastName || "Sin Nombre"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.syscafeOrder || 'N/A'}
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
                  {/* Observaciones */}
            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
            {order.addres?.trim()
              ? <span className="block truncate" title={order.addres}>{order.addres}</span>
              : <span className="text-gray-400">—</span>
            }
          </td>


            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 underline">
              {order?._id ? (
              <Link 
                to={`/orders/${order._id}`} 
                className="hover:underline"
              >
                Ver orden
              </Link>
            ) : (
              <span className="text-gray-400 cursor-not-allowed">ID no disponible</span>
            )}
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

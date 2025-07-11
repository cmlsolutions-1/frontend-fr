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
    <>
      <Title title="Historial Pedidos" />

      <div className="mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b">
            <tr>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Numero de pedido
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Nombre Cliente
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Estado
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Opciones
              </th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.id.split("-").at(-1)}
                </td>
                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  Carlos Pérez
                </td>
                <td className="flex items-center text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {order.isPaid ? (
                    <>
                      <IoCardOutline className="text-green-800" />
                      <span className="mx-2 text-green-800">Gestionada</span>
                    </>
                  ) : (
                    <>
                      <IoCardOutline className="text-red-800" />
                      <span className="mx-2 text-red-800">No Gestionada</span>
                    </>
                  )}
                </td>
                <td className="text-sm font-light px-6 mx-2 text-blue-600 hover:text-blue-800 underline">
                  <Link to={`/orders/${order.id}`} className="hover:underline">
                    Ver orden
                  </Link>
                </td>
                
                <td className="flex items-center text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  <IoDownloadOutline />
                  <OrderPDFButton order={order} />
                    
              
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

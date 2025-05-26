import { useEffect, useState } from "react";
import { getMockOrdersByUser } from "@/mocks/getMockOrdersByUser";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline } from "react-icons/io5";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getMockOrdersByUser().then(({ ok, orders }) => {
      if (!ok) {
        navigate("/auth/login");
        return;
      }
      setOrders(orders || []);
    });
  }, [navigate]);

  return (
    <>
      <Title title="Historial Pedidos" />

      <div className="mb-10">
        <table className="min-w-full">
          <thead className="bg-gray-200 border-b">
            <tr>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Numero de pedido</th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Nombre Cliente</th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Estado</th>
              <th className="text-sm font-medium text-gray-900 px-6 py-4 text-left">Opciones</th>
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
                  {order.OrderAddress?.firstName} {order.OrderAddress?.lastName}
                </td>
                <td className="flex items-center text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                  {order.isPaid ? (
                    <>
                      <IoCardOutline className="text-green-800" />
                      <span className="mx-2 text-green-800">Pagada</span>
                    </>
                  ) : (
                    <>
                      <IoCardOutline className="text-red-800" />
                      <span className="mx-2 text-red-800">No Pagada</span>
                    </>
                  )}
                </td>
                <td className="text-sm text-gray-900 font-light px-6">
                  <Link to={`/orders/${order.id}`} className="hover:underline">
                    Ver orden
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

//src/pages/admin/OrdersPageAdmin.tsx

import { useEffect, useState } from "react";
import { Title } from "@/components";
import { useNavigate, Link } from "react-router-dom";
import { IoCardOutline, IoDownload, IoDownloadOutline } from "react-icons/io5";
import { OrderPDFButton } from '@/components/orders/OrderPDFButton';
import { getOrdersByUser } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import type { Order } from "@/interfaces/order.interface";
import { getClientById } from "@/services/client.service";
import { getSalesPersonById } from "@/services/client.service";
import { Home } from "lucide-react";


export default function OrdersPageAdmin() {


  // ACTIVAR BAKEND 
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { user } = useAuthStore();

  // Estados para almacenar los usuarios obtenidos
  const [clientsMap, setClientsMap] = useState<Record<string, any>>({}); // { id: userData }
  const [salesPersonsMap, setSalesPersonsMap] = useState<Record<string, any>>({});



  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrdersByUser();
        setOrders(data.orders || []);
      } catch (error) {
      console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Cargar clientes y vendedores una vez que se tengan los pedidos
  useEffect(() => {
    if (orders.length === 0) {
      setLoadingUsers(false); // Si no hay pedidos, no hay usuarios que cargar
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true); // Indicar que se están cargando los usuarios
      try {
        // Extraer IDs únicos de clientes y vendedores
        const clientIds = Array.from(
          new Set(orders.map((order) => order.idClient).filter(Boolean)) // Filtrar posibles valores nulos
        );
        const salesPersonIds = Array.from(
          new Set(orders.map((order) => order.idSalesPerson).filter(Boolean))
        );

  
        
        // Llamar al backend para obtener los datos de forma concurrente
        const [clientsData, salesPersonsData] = await Promise.all([
          Promise.all(clientIds.map(id => getClientById(id).catch(() => null))), 
          Promise.all(salesPersonIds.map(id => getSalesPersonById(id).catch(() => null))), 
        ]);

        // Filtrar resultados nulos y crear mapas para acceso rápido
        const clientsMapTemp: Record<string, any> = {};
        clientIds.forEach((id, index) => {
          const client = clientsData[index];
          if (client) {
            clientsMapTemp[id] = client;
          }
        });

        const salesPersonsMapTemp: Record<string, any> = {};
        salesPersonIds.forEach((id, index) => {
          const salesPerson = salesPersonsData[index];
          if (salesPerson) {
            salesPersonsMapTemp[id] = salesPerson;
          }
        });

        setClientsMap(clientsMapTemp);
        setSalesPersonsMap(salesPersonsMapTemp);
      } catch (error) {
        console.error("Error al cargar clientes o vendedores:", error);
        // Opcional: manejar el error, limpiar mapas, etc.
        setClientsMap({});
        setSalesPersonsMap({});
      } finally {
        setLoadingUsers(false); // Finalizar indicador de carga de usuarios
      }
    };

    fetchUsers();
  }, [orders]); // Se ejecuta cuando cambian los pedidos
  

  if (loading || loadingUsers) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {loading ? "Cargando Pedidos..." : "Cargando Usuarios..."}
          </p>
        </div>
      </div>
    );
  }

  // Función para obtener nombre de cliente
  const getClientName = (clientId: string) => {
    const client = clientsMap[clientId];
    if (client) {
      return `${client.name || ""} ${client.lastName || ""}`.trim() || "Sin Nombre";
    }
    return "Cliente no encontrado";
  };

  // Función para obtener nombre de vendedor
  const getSalesPersonName = (salesPersonId: string) => {
    const salesPerson = salesPersonsMap[salesPersonId];
    if (salesPerson) {
      return `${salesPerson.name || ""} ${salesPerson.lastName || ""}`.trim() || "Sin Nombre";
    }
    return "Vendedor no encontrado";
  };


  return (
    <div className="px-4 sm:px-8 py-4 mt-[120px] space-y-4">
      {/* Título principal */}
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
      Lista de Pedidos Clientes
    </h1>
    {/* Subtitle + botón en la misma fila */}
      <div className="flex items-center justify-between">
        <p className="text-base md:text-lg text-gray-600">
          Revisa los pedidos de todos los clientes y descarga el PDF cuando lo necesites
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
                Nombre Vendedor
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                Pedido Syscafe
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">
                Observaciones
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
                key={order._id}
                className="border-b hover:bg-[#f4c04827] transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                {order.orderNumber || order._id?.slice(-6) || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {getClientName(order.idClient)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {getSalesPersonName(order.idSalesPerson)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.syscafeOrder || 'N/A'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
              <div className="flex items-center">
                <IoCardOutline
                  className={
                    order.isCanceled
                      ? "text-orange-600"
                      : order.isPaid
                      ? "text-green-700"
                      : "text-red-700"
                  }
                />
                <span
                  className={`ml-2 font-medium ${
                    order.isCanceled
                      ? "text-orange-600"
                      : order.isPaid
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {order.isCanceled ? "Anulada" : order.isPaid ? "Gestionada" : "No Gestionada"}
                </span>
              </div>
            </td>

            {/* Observaciones */}
            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
              {order.isCanceled ? (
                <span className="block truncate text-orange-700" title={order.reasonCancellation || ""}>
                  {order.reasonCancellation?.trim() ? `Motivo: ${order.reasonCancellation}` : "Motivo: —"}
                </span>
              ) : order.addres?.trim() ? (
                <span className="block truncate" title={order.addres}>{order.addres}</span>
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

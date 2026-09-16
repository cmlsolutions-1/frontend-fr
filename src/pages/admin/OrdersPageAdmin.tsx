//src/pages/admin/OrdersPageAdmin.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { IoCardOutline, IoDownloadOutline } from "react-icons/io5";
import { OrderPDFButton } from "@/components/orders/OrderPDFButton";
import { getOrdersByUser } from "@/services/orders.service";
import { useAuthStore } from "@/store/auth-store";
import { getClientById, getSalesPersonById } from "@/services/client.service";
import { Home, ArrowUp } from "lucide-react";
import { Pagination } from "@/components";

type StatusFilter = "ALL" | "PAID" | "UNPAID" | "CANCELED";

const truncateText = (value?: string, maxLength = 20) => {
  if (!value?.trim()) return "N/A";
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

export default function OrdersPageAdmin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = `/admin/orders${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuthStore();

  // botón flotante
  const [showScrollTop, setShowScrollTop] = useState(false);

  // filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [clientQuery, setClientQuery] = useState("");
  const [salesQuery, setSalesQuery] = useState("");

  // mapas
  const [clientsMap, setClientsMap] = useState<Record<string, any>>({});
  const [salesPersonsMap, setSalesPersonsMap] = useState<Record<string, any>>({});

  // paginación
  const ORDERS_PER_PAGE = 50;
  const pageFromUrl = parseInt(searchParams.get("page") || "1");
  const currentPage = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await getOrdersByUser({
          page: currentPage,
          limit: ORDERS_PER_PAGE,
        });
        setOrders(data.orders || []);
        setTotalOrders(data.total || data.orders?.length || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
        setOrders([]);
        setTotalOrders(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [currentPage]);

  useEffect(() => {
    if (orders.length === 0) {
      setLoadingUsers(false);
      return;
    }

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const clientIds = Array.from(new Set(orders.map((o) => o.idClient).filter(Boolean)));
        const salesPersonIds = Array.from(new Set(orders.map((o) => o.idSalesPerson).filter(Boolean)));

        const [clientsData, salesPersonsData] = await Promise.all([
          Promise.all(clientIds.map((id) => getClientById(id).catch(() => null))),
          Promise.all(salesPersonIds.map((id) => getSalesPersonById(id).catch(() => null))),
        ]);

        const clientsTemp: Record<string, any> = {};
        clientIds.forEach((id, idx) => {
          const c = clientsData[idx];
          if (c) clientsTemp[id] = c;
        });

        const salesTemp: Record<string, any> = {};
        salesPersonIds.forEach((id, idx) => {
          const s = salesPersonsData[idx];
          if (s) salesTemp[id] = s;
        });

        setClientsMap(clientsTemp);
        setSalesPersonsMap(salesTemp);
      } catch (error) {
        console.error("Error al cargar clientes o vendedores:", error);
        setClientsMap({});
        setSalesPersonsMap({});
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [orders]);

  // helpers nombres
  const getClientName = (clientId: string) => {
    const client = clientsMap[clientId];
    if (client) return `${client.name || ""} ${client.lastName || ""}`.trim() || "Sin Nombre";
    return "Cliente no encontrado";
  };

  const getSalesPersonName = (salesPersonId: string) => {
    const sp = salesPersonsMap[salesPersonId];
    if (sp) return `${sp.name || ""} ${sp.lastName || ""}`.trim() || "Sin Nombre";
    return "Vendedor no encontrado";
  };

  // scroll btn
  useEffect(() => {
    const el = document.getElementById("main-content");
    if (!el) return;

    const handleScroll = () => setShowScrollTop(el.scrollTop > 50);
    el.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const el = document.getElementById("main-content");
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");

    navigate(`?${params.toString()}`, { replace: true });

    setTimeout(() => {
      const el = document.getElementById("main-content");
      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const resetToFirstPage = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    navigate(`?${params.toString()}`, { replace: true });
  };

  // filtrar sobre la página actual. La carga pesada ya queda paginada desde backend.
  const filteredOrders = useMemo(() => {
    const cq = clientQuery.trim().toLowerCase();
    const sq = salesQuery.trim().toLowerCase();

    return orders.filter((o) => {
      // Estado
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CANCELED" && !!o.isCanceled) ||
        (statusFilter === "PAID" && !o.isCanceled && !!o.isPaid) ||
        (statusFilter === "UNPAID" && !o.isCanceled && !o.isPaid);

      if (!matchStatus) return false;

      // Cliente
      if (cq) {
        const clientName = getClientName(o.idClient).toLowerCase();
        if (!clientName.includes(cq)) return false;
      }

      // Vendedor
      if (sq) {
        const salesName = getSalesPersonName(o.idSalesPerson).toLowerCase();
        if (!salesName.includes(sq)) return false;
      }

      return true;
    });
  }, [orders, statusFilter, clientQuery, salesQuery, clientsMap, salesPersonsMap]);

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

  return (
    <div className="px-4 sm:px-8 py-4 mt-[120px] space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Lista de Pedidos Clientes</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-base md:text-lg text-gray-600">
          Revisa los pedidos de todos los clientes y descarga el PDF cuando lo necesites
        </p>

        <button
          onClick={() => navigate("/homePage")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F4C048] transition"
        >
          <Home className="w-4 h-4" />
          Inicio
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white border rounded-lg p-4 flex items-center gap-4 flex-wrap">
        {/* Estado */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              resetToFirstPage();
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">Todos</option>
            <option value="UNPAID">No Gestionada</option>
            <option value="PAID">Gestionada</option>
            <option value="CANCELED">Anulada</option>
          </select>
        </div>

        {/* Cliente */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Cliente:</span>
          <input
            value={clientQuery}
            onChange={(e) => {
              setClientQuery(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Ej: Maria"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        {/* Vendedor */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Vendedor:</span>
          <input
            value={salesQuery}
            onChange={(e) => {
              setSalesQuery(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Ej: Carlos"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        <div className="ml-auto text-sm text-gray-500">
          Mostrando {filteredOrders.length} de {totalOrders} pedido(s)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Nro. Pedido</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Nombre Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Nombre Vendedor</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Pedido Syscafe</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Observaciones</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Opciones</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {filteredOrders.map((order) => (
              (() => {
                const clientName = getClientName(order.idClient);

                return (
              <tr key={order._id} className="border-b hover:bg-[#f4c04827] transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.orderNumber || order._id?.slice(-6) || "N/A"}
                </td>

                <td
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-[260px]"
                  title={clientName}
                >
                  {truncateText(clientName, 32)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {getSalesPersonName(order.idSalesPerson)}
                </td>

                <td
                  className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 max-w-[180px]"
                  title={order.syscafeOrder || "N/A"}
                >
                  {truncateText(order.syscafeOrder)}
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

                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                  {order.isCanceled ? (
                    <span
                      className="block truncate text-orange-700"
                      title={
                        order.reasonCancellation?.trim()
                          ? `Motivo: ${order.reasonCancellation}`
                          : "Motivo: —"
                      }
                    >
                      {truncateText(
                        order.reasonCancellation?.trim()
                          ? `Motivo: ${order.reasonCancellation}`
                          : "Motivo: —",
                        32
                      )}
                    </span>
                  ) : order.addres?.trim() ? (
                    <span className="block truncate" title={order.addres}>
                      {truncateText(order.addres, 32)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 underline">
                  <Link
                    to={`/orders/${order._id}`}
                    state={{ returnTo }}
                    className="hover:underline"
                  >
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
                );
              })()
            ))}
          </tbody>
        </table>
      </div>

      <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#F4C048] hover:bg-[#f1b212] text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 opacity-90 hover:opacity-100 z-[9999]"
          aria-label="Volver al inicio"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

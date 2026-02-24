//src/pages/admin/OrdersPageAdmin.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { IoCardOutline, IoDownloadOutline } from "react-icons/io5";
import { OrderPDFButton } from "@/components/orders/OrderPDFButton";
import { useAuthStore } from "@/store/auth-store";
import { getOrdersBySalesPerson } from "@/services/orders.service";
import { ArrowUp, Home } from "lucide-react";
import { Pagination } from "@/components";

type StatusFilter = "ALL" | "PAID" | "UNPAID" | "CANCELED";

export default function OrdersPageSalesPerson() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // botón flotante
  const [showScrollTop, setShowScrollTop] = useState(false);

  // filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [clientQuery, setClientQuery] = useState("");

  // paginación
  const ORDERS_PER_PAGE = 50;
  const pageFromUrl = parseInt(searchParams.get("page") || "1");
  const currentPage = Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

  // cargar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      try {
        if (!user || user.role !== "SalesPerson") {
          setOrders([]);
          return;
        }

        const result = await getOrdersBySalesPerson(user._id);
        setOrders(result.ok ? result.orders : []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  // scroll para botón flotante
  useEffect(() => {
    const scrollableElement = document.getElementById("main-content");
    if (!scrollableElement) return;

    const handleScroll = () => setShowScrollTop(scrollableElement.scrollTop > 50);

    scrollableElement.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      scrollableElement.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const scrollableElement = document.getElementById("main-content");
    if (scrollableElement) scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
  };

  // cambiar página (igual HomePage)
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

  //reset page a 1 cuando cambian filtros
  const resetToFirstPage = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    navigate(`?${params.toString()}`, { replace: true });
  };

  // filtrar antes de paginar
  const filteredOrders = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();

    return orders.filter((o) => {
      // Estado
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "CANCELED" && !!o.isCanceled) ||
        (statusFilter === "PAID" && !o.isCanceled && !!o.isPaid) ||
        (statusFilter === "UNPAID" && !o.isCanceled && !o.isPaid);

      if (!matchStatus) return false;

      // Cliente
      if (!q) return true;
      const fullName = `${o?.Client?.name || ""} ${o?.Client?.lastName || ""}`.trim().toLowerCase();
      return fullName.includes(q);
    });
  }, [orders, statusFilter, clientQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando ordenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-4 mt-[120px] space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Pedidos Clientes</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-base md:text-lg text-gray-600">
          Revisa los pedidos de tus clientes y descarga el PDF cuando lo necesites
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
            placeholder="Ej: Juan Perez"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
          />
        </div>

        {/* Contador */}
        <div className="ml-auto text-sm text-gray-500">
          Mostrando {filteredOrders.length} pedido(s)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Nro. Pedido</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Nombre Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Pedido Syscafe</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-black">Observaciones</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Opciones</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-gray-100 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.orderNumber || order._id?.slice(-6) || "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {order.Client && order.Client.name && order.Client.lastName
                    ? `${order.Client.name} ${order.Client.lastName}`
                    : order.Client && (order.Client.name || order.Client.lastName)
                    ? order.Client.name || order.Client.lastName
                    : "Cliente no encontrado"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                  {order.syscafeOrder || "N/A"}
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
// src/components/userGestion/VendedoresManager.tsx
import { useState, useEffect } from "react";
import VendedorModal from "./VendedorModal";
import { Button } from "@/components/ui/Button";
import { getVendedores } from "@/services/seller.service";
import type { Vendedor } from "@/interfaces/user.interface";

export default function VendedoresManager() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);

  // Cargar vendedores al montar el componente
  useEffect(() => {
    const loadVendedores = async () => {
      try {
        const data = await getVendedores();
        setVendedores(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar vendedores:", err);
        setError("No se pudieron cargar los vendedores. Intenta nuevamente.");
        setVendedores([]);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
  }, []);

  const getPrimaryEmail = (vendedor: Vendedor) => {
    return Array.isArray(vendedor.email) && vendedor.email.length > 0
      ? vendedor.email[0].EmailAddres.trim() || "No especificado"
      : "Sin email";
  };

  const getPrimaryPhone = (vendedor: Vendedor) => {
    const phone = vendedor.phone?.[0];
    if (!phone) return "Sin teléfono";
    return `${phone.Indicative} ${phone.NumberPhone}`.trim().length > 5
      ? `${phone.Indicative} ${phone.NumberPhone}`
      : "No especificado";
  };

  // Función para abrir modal de creación
  const handleCreate = () => {
    setEditingVendedor(null);
    setIsModalOpen(true);
  };

  // Función para abrir modal de edición
  const handleEdit = (vendedor: Vendedor) => {
    setEditingVendedor(vendedor);
    setIsModalOpen(true);
  };

  // Función que se llama después de guardar (crear o editar)
  const handleSave = async (vendedorGuardado: Vendedor) => {
    if (editingVendedor) {
      // Actualizar en la lista
      setVendedores((prev) =>
        prev.map((v) => (v.id === vendedorGuardado.id ? vendedorGuardado : v))
      );
    } else {
      // Agregar nuevo vendedor
      setVendedores((prev) => [...prev, vendedorGuardado]);
    }
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando vendedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Vendedores
        </h1>
        <Button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700"
        >
          + Nuevo Vendedor
        </Button>
      </div>

      {/* Tabla de vendedores */}
      {vendedores.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No hay vendedores registrados.
        </p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendedores.map((vendedor) => (
                <tr key={vendedor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {vendedor.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {vendedor.name} {vendedor.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {getPrimaryEmail(vendedor)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {getPrimaryPhone(vendedor)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {vendedor.city || "Desconocida"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        vendedor.estado === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vendedor.estado?.charAt(0).toUpperCase() +
                        vendedor.estado?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vendedor)}
                      className="mr-2"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para crear/editar */}
      <VendedorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        vendedor={editingVendedor}
      />
    </div>
  );
}

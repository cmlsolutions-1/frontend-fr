// src/components/userGestion/VendedoresManager.tsx
import { useState, useEffect } from "react";
import VendedorModal from "./VendedorModal";
import { Button } from "@/components/ui/Button";
import { getVendedores } from "@/services/seller.service";
import type { Vendedor } from "@/interfaces/user.interface";
import { createVendedor, updateVendedor } from "@/services/seller.service";
import { User } from "@/interfaces/user.interface";

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

  function getPrimaryEmail(user: User): string {
    // Verifica si existe emails directamente
    if (!user.emails || !Array.isArray(user.emails)) return "Sin correo";

    // Si no hay emails registrados
    if (user.emails.length === 0) return "Sin correo";

    // Busca el email principal o toma el primero
    const email = user.emails.find((e) => e?.IsPrincipal) ?? user.emails[0];
    return email?.EmailAddres?.trim() || "Sin correo";
  }

  function getPrimaryPhone(user: User): string {
    // Verifica si existe phones directamente
    if (!user.phones || !Array.isArray(user.phones)) return "Sin teléfono";

    // Si no hay teléfonos registrados
    if (user.phones.length === 0) return "Sin teléfono";

    // Busca el teléfono principal o toma el primero
    const phone = user.phones.find((p) => p?.IsPrincipal) ?? user.phones[0];
    const indicative = phone?.Indicative || "";
    const number = phone?.NumberPhone || "";
    return indicative && number ? `${indicative} ${number}` : "Sin teléfono";
  }
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
  const handleSave = async (vendedorData: Vendedor) => {
    try {
      let vendedorFinal: Vendedor;

      if (editingVendedor) {
        const vendedorParaActualizar: Vendedor = {
          ...editingVendedor, // ID, _id y datos originales
          ...vendedorData, // Datos actualizados del formulario (puede sobrescribir id/_id si están)
          // Asegurar que el ID para actualizar esté presente
          id: editingVendedor.id, // Preferir el ID original
          _id: editingVendedor._id, // Preferir el _id original
        };

        // Ahora pasamos el objeto completo que sabemos que tiene id/_id
        vendedorFinal = await updateVendedor(vendedorParaActualizar);
        // --- Fin del cambio ---
      } else {
        vendedorFinal = await createVendedor(vendedorData);
        if (!vendedorFinal.emails) vendedorFinal.emails = [];
        if (!vendedorFinal.phones) vendedorFinal.phones = [];
      }

      setVendedores((prev) => {
        const yaExiste = prev.some((v) => v.id === vendedorFinal.id);
        return yaExiste
          ? prev.map((v) => (v.id === vendedorFinal.id ? vendedorFinal : v))
          : [...prev, vendedorFinal];
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al guardar vendedor:", err);
      // Es mejor mostrar el mensaje de error específico si existe
      alert(
        `Ocurrió un error al guardar el vendedor: ${
          err instanceof Error ? err.message : "Error desconocido"
        }`
      );
    }
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Vendedores
        </h1>
        <Button
          onClick={handleCreate}
          className="bg-[#F2B318] hover:bg-[#F4C048]"
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
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ciudad
                </th> */}
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
                    {typeof vendedor.id === "string"
                      ? vendedor.id.slice(0, 8) + "..."
                      : "—"}
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
                  {/* <td className="px-6 py-4 text-sm text-gray-700">
                    {vendedor.city || "Desconocida"}
                  </td> */}
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        vendedor.state === "activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {typeof vendedor.state === "string"
                        ? vendedor.state.charAt(0).toUpperCase() +
                          vendedor.state.slice(1)
                        : "Desconocido"}
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

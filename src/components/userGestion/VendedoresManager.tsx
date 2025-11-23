// src/components/userGestion/VendedoresManager.tsx
import { useState, useEffect } from "react";
import VendedorModal from "./VendedorModal";
import { Button } from "@/components/ui/Button";
import { getVendedores } from "@/services/seller.service";
import type { Vendedor } from "@/interfaces/user.interface";
import { createVendedor, updateVendedor,getSalesPersonById } from "@/services/seller.service";
import { User } from "@/interfaces/user.interface";
import { toggleUserState } from "@/services/client.service";



export default function VendedoresManager() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const handleToggleState = async (vendedor: Vendedor) => {
    if (!vendedor._id) {
      alert("No se puede cambiar el estado del vendedor: ID no disponible.");
      return;
    }

    const userIdToToggle = vendedor._id;
    setLoadingToggle(userIdToToggle);

    try {
      await toggleUserState(userIdToToggle);

      // Actualizar el estado local de la lista de vendedores
      setVendedores(prevVendedores =>
        prevVendedores.map(v =>
          v._id === vendedor._id
            ? { ...v, state: v.state === 'activo' ? 'inactivo' : 'activo' }
            : v
        )
      );

    } catch (error) {
      console.error("Error al cambiar estado del vendedor:", error);
      alert(error instanceof Error ? error.message : "Error al cambiar el estado del vendedor.");
    } finally {
      setLoadingToggle(null);
    }
  };

  // Cargar vendedores al montar el componente
  useEffect(() => {
    const loadVendedores = async () => {
      try {
        const data = await getVendedores();
        setVendedores(Array.isArray(data) ? data : []);
      } catch (err) {

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
    const emailValue = email?.EmailAddress || email?.EmailAddres || "";
  return emailValue.trim() || "Sin correo";
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
  // Función que se llama después de guardar (crear o editar)
const handleSave = async (vendedorData: Vendedor) => {
  try {
    if (editingVendedor) {
      // Actualizar vendedor existente
      const vendedorActualizado = await updateVendedor({
        ...editingVendedor,
        ...vendedorData,
        _id: editingVendedor._id,
      });

      // Actualizar en la lista local
      setVendedores((prev) =>
        prev.map((v) =>
          (v._id === vendedorActualizado._id || (v.id && v.id === vendedorActualizado.id))
            ? vendedorActualizado
            : v
        )
      );
    } else {
      // Crear nuevo vendedor
      const nuevoVendedor = await createVendedor(vendedorData);
      
      // Recargar la lista completa para asegurar consistencia
      const data = await getVendedores();
      setVendedores(Array.isArray(data) ? data : []);
    }

    setIsModalOpen(false);
  } catch (err) {
    alert(
      `Ocurrió un error al guardar el vendedor: ${
        err instanceof Error ? err.message : "Error desconocido"
      }`
    );
  }
};
  

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Vendedores...</p>
        </div>
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
    <div className="p-4 sm:p-6 min-h-screen ">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Vendedores
        </h1>
        <Button
          onClick={handleCreate}
          className="bg-[#555554] hover:bg-[#F4C048]"
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
                  Cédula
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleState(vendedor)}
                      disabled={loadingToggle === vendedor._id} // Deshabilitar mientras se cambia el estado
                      className={
                        vendedor.state === "activo"
                          ? "text-red-600 hover:text-red-700" // Color para desactivar
                          : "text-green-600 hover:text-green-700" // Color para activar
                      }
                      title={loadingToggle === vendedor._id ? "Cambiando..." : vendedor.state === "activo" ? "Desactivar" : "Activar"}
                    >
                      {loadingToggle === vendedor._id ? (
                        // Icono de carga
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : vendedor.state === "activo" ? (
                        <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span>Desactivar</span>
                            </div>
                      ) : (
                        // Icono para activar (por ejemplo, un círculo con un check)
                        <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Activar</span>
                            </div>
                      )}
                    </Button>
                  </td>
                  
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    
                    
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

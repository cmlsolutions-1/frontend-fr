// src/components/userGestion/VendedoresManager.tsx
import { useEffect, useState } from "react";
import { Vendedor } from "@/components/userGestion/types";
import VendedorModal from "./VendedorModal";
import { Button } from "@/components/ui/Button";
import ClientesManager from "./ClientesManager";
import {
  createVendedor,
  updateVendedor,
  deleteVendedor,
} from "@/services/seller.service";

import { getVendedores } from "@/services/seller.service";

interface VendedoresManagerProps {
  searchTerm: string;
  setVendedores: (vendedores: Vendedor[]) => void;
}

export default function VendedoresManager({
  searchTerm,
  setVendedores,
}: VendedoresManagerProps) {
  const [vendedores, setLocalVendedores] = useState<Vendedor[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [vendedorEditando, setVendedorEditando] = useState<Vendedor | null>(null);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string | null>(null);

  // Cargar vendedores desde localStorage al iniciar
  useEffect(() => {
    const datosGuardados = localStorage.getItem("vendedores");
    if (datosGuardados) {
      try {
        const parsed = JSON.parse(datosGuardados);
        if (Array.isArray(parsed)) setLocalVendedores(parsed);
      } catch (error) {
        console.error("Error al leer vendedores del localStorage:", error);
      }
    }
  }, []);

  // Guardar vendedores en localStorage y propagar al padre
  useEffect(() => {
    localStorage.setItem("vendedores", JSON.stringify(vendedores));
    setVendedores(vendedores);
  }, [vendedores, setVendedores]);

  const agregarOActualizarVendedor = async (
    data: Omit<Vendedor, "fechaIngreso" | "ventasDelMes">
  ) => {
    try {
      if (vendedorEditando) {
        const vendedorActualizado = await updateVendedor(vendedorEditando.id, data);
        setLocalVendedores((prev) =>
          prev.map((v) => (v.id === vendedorActualizado.id ? vendedorActualizado : v))
        );
      } else {
        const nuevo = await createVendedor(data);
        setLocalVendedores((prev) => [...prev, nuevo]);
      }
  
      setVendedorEditando(null);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al guardar vendedor:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVendedores();
      setLocalVendedores(data);
    };
    fetchData();
  }, []);
  

  const eliminarVendedor = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este vendedor?")) {
      setLocalVendedores((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const vendedoresFiltrados = vendedores.filter((v) =>
    `${v.name} ${v.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gestión de Vendedores</h2>
        <Button onClick={() => {
          setVendedorEditando(null);
          setModalOpen(true);
        }}>
          Nuevo Vendedor
        </Button>
      </div>

      {/* Tabla de vendedores */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Territorio</th>
            <th>Comisión</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedoresFiltrados.length > 0 ? (
            vendedoresFiltrados.map((v) => (
              <tr key={v.id} className="text-center border-t">
                <td>{v.id}</td>
                <td>{v.name} {v.apellido}</td>
                <td>{v.email}</td>
                <td>{v.telefono}</td>
                <td>{v.territorio}</td>
                <td>{v.comision}%</td>
                <td>{v.estado}</td>
                <td className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVendedorEditando(v);
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => eliminarVendedor(v.id)}
                  >
                    Eliminar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedVendedorId(v.id)}
                  >
                    Ver Clientes
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No hay vendedores registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Clientes del vendedor */}
      {selectedVendedorId && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">
            Clientes Asociados al Vendedor
          </h3>
          <ClientesManager
            searchTerm=""
            vendedores={vendedores}
            selectedVendedorId={selectedVendedorId}
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSelectedVendedorId(null)}
          >
            Volver a Vendedores
          </Button>
        </div>
      )}

      {/* Modal para agregar/editar vendedor */}
      <VendedorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={agregarOActualizarVendedor}
        vendedor={vendedorEditando}
      />
    </div>
  );
}

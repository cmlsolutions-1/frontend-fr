//src/components/userGestion/ClientesManager.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import ClienteModal from "@/components/userGestion/ClienteModal";
import { Cliente, Vendedor } from "@/components/userGestion/types";
import { saveClient, deleteClient, getClientsBySeller } from "@/services/client.service";

interface ClientesManagerProps {
  searchTerm: string;
  vendedores: Vendedor[];
  selectedVendedorId?: string; // ID del vendedor seleccionado (opcional)
}
// Helpers de localStorage
const loadClientesFromLocalStorage = (): Cliente[] => {
  try {
    const stored = localStorage.getItem("clientes");
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error al cargar desde localStorage:", err);
    return [];
  }
};

const saveClientesToLocalStorage = (clientes: Cliente[]) => {
  try {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  } catch (err) {
    console.error("Error al guardar en localStorage:", err);
  }
};

export default function ClientesManager({ searchTerm, vendedores, selectedVendedorId }: ClientesManagerProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Cargar clientes desde API o localStorage
  useEffect(() => {
    const load = async () => {
      if (selectedVendedorId) {
        const data = await getClientsBySeller(selectedVendedorId);
        setClientes(data);
      } else {
        const data = loadClientesFromLocalStorage();
        setClientes(data);
      }
    };
    load();
  }, [selectedVendedorId]);
  
// Filtrar por búsqueda y vendedor
useEffect(() => {
  let result = clientes;

  if (searchTerm) {
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email[0]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone[0]?.numberPhone
    );
  }

  if (selectedVendedorId) {
    result = result.filter((c) => c.vendedorId === selectedVendedorId);
  }

  setFilteredClientes(result);
}, [clientes, searchTerm, selectedVendedorId]);

const handleCreateCliente = () => {
  setEditingCliente(null);
  setIsModalOpen(true);
};

const handleEditCliente = (cliente: Cliente) => {
  setEditingCliente(cliente);
  setIsModalOpen(true);
};

const handleDeleteCliente = (id: string) => {
  if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
    const updated = clientes.filter((c) => c.id !== id);
    setClientes(updated);
    saveClientesToLocalStorage(updated);
    deleteClient(id); // Aquí puedes integrar llamada a backend
  }
};

const handleSaveCliente = (clienteData: Omit<Cliente, "fechaRegistro">) => {
  if (editingCliente) {
    // Editar cliente
    const updated = clientes.map((c) =>
      c.id === editingCliente.id ? { ...c, ...clienteData } : c
    );
    setClientes(updated);
    saveClientesToLocalStorage(updated);
    saveClient({ ...editingCliente, ...clienteData }); // Llamada al backend
  } else {
    // Nuevo cliente
    const newCliente: Cliente = {
      ...clienteData,
      id: crypto.randomUUID(),
      fechaRegistro: new Date().toISOString().split("T")[0],
    };
    const updated = [...clientes, newCliente];
    setClientes(updated);
    saveClientesToLocalStorage(updated);
    saveClient(newCliente); // Llamada al backend
  }

  setIsModalOpen(false);
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">
            {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""} encontrado
            {filteredClientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={handleCreateCliente} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.map((cliente) => (
          <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {cliente.name} {cliente.lastName}
                  </CardTitle>
                  <div className="text-sm font-mono text-gray-500 mt-1">ID: {cliente.id}</div>
                  <Badge variant={cliente.estado === "activo" ? "default" : "secondary"} className="mt-1">
                    {cliente.estado}
                  </Badge>
                  <Badge variant={cliente.tipoCliente === "VIP" ? "default" : "secondary"} className="mt-1">
                    {cliente.tipoCliente}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEditCliente(cliente)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCliente(cliente.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{cliente.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{cliente.phone[0]?.numberPhone ?? "Sin teléfono"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                {cliente.address[0]?.city.name ?? "Ciudad desconocida"}, {cliente.address[0]?.country.name ?? "País"}
                </span>
              </div>
              <div className="text-xs text-gray-500 pt-2">
                Registrado: {new Date(cliente.fechaRegistro).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pasar la lista de vendedores al modal */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={editingCliente}
        vendedores={vendedores} // Agregar esta línea
      />
    </div>
  );
}
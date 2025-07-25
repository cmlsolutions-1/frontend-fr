import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
import ClienteModal from "@/components/userGestion/ClienteModal";
import { Cliente, Vendedor } from "@/interfaces/user.interface";
import { saveClient, updateClient, getClientsBySeller } from "@/services/client.service";

interface ClientesManagerProps {
  searchTerm: string;
  vendedores: Vendedor[];
  selectedVendedorId?: string;
}

// Helper para cargar clientes del localStorage
const loadClientesFromLocalStorage = (): Cliente[] => {
  try {
    const stored = localStorage.getItem("clientes");
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error al cargar desde localStorage:", err);
    return [];
  }
};

// Helper para guardar clientes en localStorage
const saveClientesToLocalStorage = (clientes: Cliente[]) => {
  try {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  } catch (err) {
    console.error("Error al guardar en localStorage:", err);
  }
};

export default function ClientesManager({ 
  searchTerm, 
  vendedores, 
  selectedVendedorId 
}: ClientesManagerProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar clientes desde localStorage (ya que getClientsBySeller no está disponible)
  useEffect(() => {
    setLoading(true);
    try {
      const data = loadClientesFromLocalStorage();
      
      // Filtrar por vendedor si está seleccionado
      const filtered = selectedVendedorId 
        ? data.filter(c => c.salesPerson === selectedVendedorId)
        : data;
      
      setClientes(filtered);
      setError(null);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError("No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [selectedVendedorId]);
  
  // Filtrar por búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClientes(clientes);
      return;
    }

    

    const term = searchTerm.toLowerCase();
    const result = clientes.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.emails?.[0]?.emailAddress?.toLowerCase().includes(term) ||
      c.phones?.[0]?.numberPhone?.includes(searchTerm)
    );

    setFilteredClientes(result);
  }, [clientes, searchTerm]);

  const handleCreateCliente = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este cliente?")) return;

    try {
      // Intenta eliminar en el backend primero
      //await deleteClient(id);
      
      // Si tiene éxito, actualiza el estado local
      const updated = clientes.filter(c => c.id !== id);
      setClientes(updated);
      saveClientesToLocalStorage(updated);
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      alert("No se pudo eliminar el cliente. Intente nuevamente.");
    }
  };

  const handleSaveCliente = async (clienteData: Cliente) => {
    try {
      console.log("handleSaveCliente recibió:", clienteData);
      console.log("Lista de vendedores disponibles:", vendedores);
  
      const vendedor = vendedores.find((v) => {
        const match = v.id === clienteData.salesPerson;
        console.log(`Comparando v.id (${v.id}) con clienteData.salesPerson (${clienteData.salesPerson}): ${match}`);
        return match;
      });

      console.log("clienteData.salesPerson:", clienteData.salesPerson);
      console.log("vendedores:", vendedores);
  
      if (!vendedor) {
        const errorMsg = `Vendedor no encontrado para ID/Cédula: '${clienteData.salesPerson}'. Verifica la selección o la lista de vendedores.`;
        console.error(errorMsg);
        alert(errorMsg);
        return;
      }
  
      console.log("Vendedor encontrado:", vendedor);
  
      const payloadToSend: Cliente = {
        ...clienteData,
        salesPerson: vendedor._id, // lo que espera el backend
        id: editingCliente?.id || crypto.randomUUID(), // usar ID existente o generar uno nuevo
      };
  
      let updatedCliente: Cliente;
  
      if (editingCliente) {
        console.log("Editando cliente existente. Payload:", payloadToSend);
        updatedCliente = await updateClient(payloadToSend);
      } else {
        console.log("Creando nuevo cliente. Payload:", payloadToSend);
        updatedCliente = await saveClient(payloadToSend);
      }
  
      const updatedClientes = editingCliente
        ? clientes.map((c) => c.id === editingCliente.id ? updatedCliente : c)
        : [...clientes, updatedCliente];
  
      setClientes(updatedClientes);
      saveClientesToLocalStorage(updatedClientes);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error al guardar cliente:", err);
      alert(err.message || "No se pudo guardar el cliente. Intente nuevamente.");
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

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

      {filteredClientes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {filteredClientes.map((cliente) => {
    // Datos seguros con valores por defecto
    const email = cliente.emails?.[0]?.emailAddress || "Sin email";
    const phoneNumber = cliente.phones?.[0]?.numberPhone || "Sin teléfono";
    const phoneIndicative = cliente.phones?.[0]?.indicative || "+57";
    const address = cliente.address?.[0] || "Sin dirección";
    const priceCategory = cliente.priceCategory || "Sin categoría";

    return (
      <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {cliente.name} {cliente.lastName}
              </CardTitle>
              <div className="text-sm font-mono text-gray-500 mt-1">ID: {cliente.id}</div>
              <Badge 
                variant={cliente.state === "activo" ? "default" : "secondary"} 
                className="mt-1"
              >
                {cliente.state || "Sin estado"}
              </Badge>
              <Badge 
                variant={priceCategory === "VIP" ? "default" : "secondary"} 
                className="mt-1 ml-1"
              >
                {priceCategory}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleEditCliente(cliente)}
              >
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
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>
              {phoneNumber === "Sin teléfono" 
                ? "Sin teléfono"
                : `${phoneIndicative} ${phoneNumber}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{address}</span>
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>
      )}

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={editingCliente}
        vendedores={vendedores}
      />
    </div>
  );
}
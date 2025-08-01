import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, Mail, MapPin, PhoneOutgoing } from "lucide-react";
import ClienteModal from "@/components/userGestion/ClienteModal";
import { Cliente, Email, Phone, Vendedor } from "@/interfaces/user.interface";
import {
  saveClient,
  updateClient,
  getClientsBySeller,
} from "@/services/client.service";

interface ClientesManagerProps {
  searchTerm: string;
  vendedores: Vendedor[];
  selectedVendedorId?: string;
}

// Helper para cargar clientes del localStorage
// src/components/userGestion/ClientesManager.tsx

// Helper para cargar clientes del localStorage y NORMALIZARLOS
const loadClientesFromLocalStorage = (): Cliente[] => {
  try {
    const stored = localStorage.getItem("clientes");
    if (!stored) return [];

    const parsedData = JSON.parse(stored);

    // Asegurarse de que cada objeto tenga la estructura de Cliente
    const normalizedData: Cliente[] = parsedData.map((item: any) => {
      // --- Normalizar emails ---
      let normalizedEmails: Email[] = [{ EmailAddress: '', IsPrincipal: true }]; // Valor por defecto

      if (Array.isArray(item.emails) && item.emails.length > 0) {
        const rawEmail = item.emails[0]; // Tomar el primer email
        let emailValue = '';

        // Probar diferentes formas en que el email podría haberse guardado
        if (typeof rawEmail.EmailAddress === 'string') {
          emailValue = rawEmail.EmailAddress;
        } else if (typeof rawEmail.emailAddress === 'string') {
          emailValue = rawEmail.emailAddress;
        } else if (typeof rawEmail.EmailAddres === 'string') { // Typo que viste
          emailValue = rawEmail.EmailAddres;
        } else if (typeof item.email === 'string') { // Formato simple del DTO de lista
          emailValue = item.email;
        }

        normalizedEmails = [{
          EmailAddress: emailValue,
          IsPrincipal: rawEmail.IsPrincipal ?? rawEmail.isPrincipal ?? true
        }];
      } else if (typeof item.email === 'string') {
        // Si viene un email simple (como en GetClientsBySalesPersonDto)
        normalizedEmails = [{ EmailAddress: item.email, IsPrincipal: true }];
      }

      // --- Normalizar phones ---
      let normalizedPhones: Phone[] = [{ NumberPhone: '', Indicative: '+57', IsPrincipal: true }]; // Valor por defecto

      if (Array.isArray(item.phones) && item.phones.length > 0) {
        const rawPhone = item.phones[0]; // Tomar el primer teléfono
        let phoneValue = '';

        // Probar diferentes formas en que el teléfono podría haberse guardado
        if (typeof rawPhone.NumberPhone === 'string') {
          phoneValue = rawPhone.NumberPhone;
        } else if (typeof rawPhone.numberPhone === 'string') {
          phoneValue = rawPhone.numberPhone;
        } else if (typeof item.phone === 'string') { // Formato simple del DTO de lista
          phoneValue = item.phone;
        }

        normalizedPhones = [{
          NumberPhone: phoneValue,
          Indicative: rawPhone.Indicative ?? rawPhone.indicative ?? '+57',
          IsPrincipal: rawPhone.IsPrincipal ?? rawPhone.isPrincipal ?? true
        }];
      } else if (typeof item.phone === 'string') {
         // Si viene un phone simple (como en GetClientsBySalesPersonDto)
        normalizedPhones = [{ NumberPhone: item.phone, Indicative: '+57', IsPrincipal: true }];
      }

      // --- Devolver un objeto que cumpla con la interfaz Cliente ---
      return {
        _id: item._id ?? '', // Si viene
        id: item.id ?? crypto.randomUUID(), // Si no viene id, generar uno? O mantener item.id ?? ''
        name: item.name ?? '',
        lastName: item.lastName ?? '',
        emails: normalizedEmails,
        phones: normalizedPhones,
        address: Array.isArray(item.address) ? item.address : (item.address ? [item.address] : ['']),
        city: item.city ?? '',
        password: '', // Nunca debería estar en localStorage
        role: item.role === 'Client' ? 'Client' : 'Client', // Asegurar rol
        priceCategory: item.priceCategory ?? '',
        salesPerson: item.salesPerson ?? item.idSalesPerson ?? '', // Probar ambas formas
        state: item.state === 'Active' ? 'activo' :
               item.state === 'Inactive' ? 'inactivo' :
               item.state === 'activo' || item.state === 'inactivo' ? item.state :
               'activo', // Mapeo y valor por defecto
        // emailVerified, emailValidated si los usas
      };
    });

    return normalizedData;
  } catch (err) {
    console.error("Error al cargar/normalizar desde localStorage:", err);
    return []; // Devolver array vacío en caso de error
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
  selectedVendedorId,
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
      console.log("Clientes RAW desde localStorage:", data);

      // Filtrar por vendedor si está seleccionado
      const filtered = selectedVendedorId
        ? data.filter((c) => c.salesPerson === selectedVendedorId)
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
    const result = clientes.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        c.emails?.[0]?.EmailAddress?.toLowerCase().includes(term) ||
        c.phones?.[0]?.NumberPhone?.includes(searchTerm)
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
      const updated = clientes.filter((c) => c.id !== id);
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
        const match = v._id === clienteData.salesPerson;
        console.log(
          `Comparando v._id (${v._id}) con clienteData.salesPerson (${clienteData.salesPerson}): ${match}`
        );
        return match;
      });

      console.log("clienteData.salesPerson:", clienteData.salesPerson);
      console.log("vendedores:", vendedores);

      if (!vendedor) {
        const errorMsg = `Vendedor no encontrado para _id: '${clienteData.salesPerson}'. Verifica la selección o la lista de vendedores.`;
        console.error(errorMsg);
        alert(errorMsg);
        return;
      }

      console.log("Vendedor encontrado:", vendedor);

      const payloadToSend: Cliente = {
        ...clienteData,
        salesPerson: clienteData.salesPerson, // lo que espera el backend
        id: editingCliente?.id || crypto.randomUUID(), // usar ID existente o generar uno nuevo
      };
      console.log(
        "Payload a enviar (ya sea para crear o actualizar):",
        payloadToSend
      );

      let updatedCliente: Cliente;

      if (editingCliente) {
        console.log("Editando cliente existente. Payload:", payloadToSend);
        updatedCliente = await updateClient(payloadToSend);
      } else {
        console.log("Creando nuevo cliente. Payload:", payloadToSend);
        updatedCliente = await saveClient(payloadToSend);
      }

      const updatedClientes = editingCliente
        ? clientes.map((c) => (c.id === editingCliente.id ? updatedCliente : c))
        : [...clientes, updatedCliente];

      setClientes(updatedClientes);
      saveClientesToLocalStorage(updatedClientes);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error al guardar cliente:", err);
      alert(
        err.message || "No se pudo guardar el cliente. Intente nuevamente."
      );
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredClientes.length} cliente
            {filteredClientes.length !== 1 ? "s" : ""} encontrado
            {filteredClientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={handleCreateCliente}
          className="bg-[#F2B318] hover:bg-[#F4C048]"
        >
          + Nuevo Cliente
        </Button>
      </div>

      {/* Lista de clientes */}
      {filteredClientes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => {
            // Datos seguros con valores por defecto
            const email = cliente.emails?.find((e) => e.IsPrincipal)?.EmailAddress || "Sin email";
            const phoneNumber =
              cliente.phones?.[0]?.NumberPhone || "Sin teléfono";
            const phoneIndicative = cliente.phones?.[0]?.Indicative || "+57";
            const address = cliente.address?.[0] || "Sin dirección";
            const priceCategory = cliente.priceCategory || "Sin categoría";

            return (
              <Card
                key={cliente.id}
                className="hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {cliente.name} {cliente.lastName}
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        ID: {cliente.id}
                        </p>
                        <div className="flex flex-wrap mt-2 gap-1">
                      <Badge
                        variant={
                          cliente.state === "activo" ? "default" : "secondary"
                        }
                        
                      >
                        {cliente.state || "Sin estado"}
                      </Badge>
                      <Badge
                        variant={
                          priceCategory === "VIP" ? "default" : "secondary"
                        }
                        
                      >
                        {priceCategory}
                      </Badge>
                    </div>
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
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutgoing className="w-4 h-4 text-gray-500" />
                    <span>
                      {phoneNumber === "Sin teléfono"
                        ? "Sin teléfono"
                        : `${phoneIndicative} ${phoneNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
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
    </div>
  );
}

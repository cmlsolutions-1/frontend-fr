//src/components/userGestion/ClientesManager.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit, Trash2, Mail, MapPinned, PhoneOutgoing, Map,MapPinHouse} from "lucide-react";
import ClienteModal from "@/components/userGestion/ClienteModal";
import { Cliente, Email, Phone, Vendedor } from "@/interfaces/user.interface";
import {
  saveClient,
  updateClient,getAllClients,toggleUserState
} from "@/services/client.service";
import { useAuthStore } from "@/store/auth-store";
import { getClientsBySalesPerson } from "@/services/client.salesPerson";
import { IoSearchOutline } from "react-icons/io5";
import { ProductSearchDropdown } from "../ui/ProductSearchDropdown";
import { ClientSearch } from "../ui/ClientSearch";



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
      let normalizedEmails: Email[] = [{ EmailAddres: '', IsPrincipal: true }]; // Valor por defecto

      if (Array.isArray(item.emails) && item.emails.length > 0) {
        const rawEmail = item.emails[0]; // Tomar el primer email
        let emailValue = '';

        // Probar diferentes formas en que el email podría haberse guardado
        if (typeof rawEmail.EmailAddres === 'string') {
          emailValue = rawEmail.EmailAddres;
        } else if (typeof rawEmail.emailAddres === 'string') {
          emailValue = rawEmail.emailAddres;
        } else if (typeof rawEmail.EmailAddres === 'string') { // Typo que viste
          emailValue = rawEmail.EmailAddres;
        } else if (typeof item.email === 'string') { // Formato simple del DTO de lista
          emailValue = item.email;
        }

        normalizedEmails = [{
          EmailAddres: emailValue,
          IsPrincipal: rawEmail.IsPrincipal ?? rawEmail.isPrincipal ?? true
        }];
      } else if (typeof item.email === 'string') {
        // Si viene un email simple (como en GetClientsBySalesPersonDto)
        normalizedEmails = [{ EmailAddres: item.email, IsPrincipal: true }];
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

      // --- Normalizar city ---
      // Asumiendo que el localStorage puede tener city como string (ID) o como objeto { _id, name, department: { ... } }
      let normalizedCity: Cliente['city'] = '';
      let extractedCityId = '';
      let extractedDepartmentId = '';

      if (typeof item.city === 'string') {
        // Caso: city es solo el ID como string
        normalizedCity = item.city;
        extractedCityId = item.city;
      } else if (typeof item.city === 'object' && item.city !== null) {
        // Caso: city es un objeto
        const cityObj = item.city;
        if (cityObj._id) {
          extractedCityId = cityObj._id;
          // Intentar extraer departmentId del objeto city
          if (cityObj.department && typeof cityObj.department === 'object' && cityObj.department._id) {
             extractedDepartmentId = cityObj.department._id;
          } else if (typeof cityObj.departmentId === 'string') {
             // En caso de que el departamento esté como ID directamente en city
             extractedDepartmentId = cityObj.departmentId;
          }
          // Mantener el objeto completo como city, o solo el ID como string, dependiendo de lo que esperes
          // Para consistencia con el backend, podrías dejarlo como string (el ID)
          normalizedCity = extractedCityId; // O como objeto { _id: cityObj._id, name: cityObj.name, ... }
        } else {
           // Si el objeto city no tiene _id, no es una ciudad válida, dejar como ''
           normalizedCity = '';
        }
      } else {
        // Caso: city es null, undefined, o un tipo inesperado
        normalizedCity = '';
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
        city: normalizedCity,
        password: '', // Nunca debería estar en localStorage
        role: item.role === 'Client' ? 'Client' : 'Client', // Asegurar rol
        priceCategoryId: item.priceCategory?._id ?? item.priceCategoryId ?? "",
        priceCategory: item.priceCategory
          ? {
              _id: item.priceCategory._id ?? "",
              code: item.priceCategory.code ?? "",
              name: item.priceCategory.name ?? "Sin categoría", // Asegura un nombre si viene vacío
            }
          : { _id: "", code: "", name: "Sin categoría" },
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

    return []; // Devolver array vacío en caso de error
  }
};

// Helper para guardar clientes en localStorage
const saveClientesToLocalStorage = (clientes: Cliente[]) => {
  try {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  } catch (err) {

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
  const { user } = useAuthStore();
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null); // Nuevo estado
  

 //funcion para estado
 const handleToggleState = async (cliente: Cliente) => {
  if (!cliente._id) {
    alert("No se puede cambiar el estado del cliente: ID no disponible.");
    return;
  }

  const userIdToToggle = cliente._id;
  setLoadingToggle(userIdToToggle);

  try {
    await toggleUserState(userIdToToggle);

    // Actualizar el estado local de la lista de clientes
    setClientes(prevClientes =>
      prevClientes.map(c =>
        c._id === cliente._id
          ? { ...c, state: c.state === 'activo' ? 'inactivo' : 'activo' }
          : c
      )
    );

  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error);
    alert(error instanceof Error ? error.message : "Error al cambiar el estado del cliente.");
  } finally {
    setLoadingToggle(null);
  }
};

    // Cargar clientes según el rol del usuario
    useEffect(() => {
      const loadClients = async () => {
        setLoading(true);
        setError(null);
        
        try {
          let clientsData: Cliente[] = [];
          
          //  Verificar rol del usuario
          if (user?.role === "Admin") {

            clientsData = await getAllClients();
          } else if (user?.role === "SalesPerson" && user._id) {
            //  Vendedor: cargar solo sus clientes

            clientsData = await getClientsBySalesPerson(user._id);
          } else {
            //  Cliente regular o sin rol: cargar desde localStorage

            clientsData = loadClientesFromLocalStorage();
          }

          setClientes(clientsData);
        } catch (err) {

          setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes");
          
          // Fallback a localStorage
          try {
            const localClients = loadClientesFromLocalStorage();
            setClientes(localClients);
          } catch (fallbackError) {

            setClientes([]);
          }
        } finally {
          setLoading(false);
        }
      };
  
      loadClients();
    }, [user, selectedVendedorId]); // Recargar cuando cambie el usuario o vendedor seleccionado
  
    // Filtrar clientes según vendedor seleccionado (para Admin)
    useEffect(() => {
      if (!selectedVendedorId) {
        setFilteredClientes(clientes);
        return;
      }
  
      // Solo aplicar filtro para Admin
      if (user?.role === "Admin") {
        const filtered = clientes.filter((c) => c.salesPersonId === selectedVendedorId);
        setFilteredClientes(filtered);
      } else {
        setFilteredClientes(clientes);
      }
    }, [clientes, selectedVendedorId, user?.role]);
  
    //  Filtrar por búsqueda
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
          c.emails?.[0]?.EmailAddres?.toLowerCase().includes(term) ||
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

      alert("No se pudo eliminar el cliente. Intente nuevamente.");
    }
  };

  const handleSaveCliente = async (clienteData: Cliente) => {
    try {


      const vendedor = vendedores.find((v) => {
        const match = v._id === clienteData.salesPersonId;
        return match;
      });



      if (!vendedor) {
        const errorMsg = `Vendedor no encontrado para _id: '${clienteData.salesPersonId}'. Verifica la selección o la lista de vendedores.`;

        alert(errorMsg);
        return;
      }

      



      const payloadToSend: Cliente = {
        ...clienteData,
        salesPersonId: clienteData.salesPersonId, // lo que espera el backend
        //id: editingCliente?.id || crypto.randomUUID(), // usar ID existente o generar uno nuevo
      };

      // No necesitas almacenar el resultado de save/update aquí si vas a recargar
      if (editingCliente) {

        await updateClient(payloadToSend); // Espera a que finalice
      } else {
        await saveClient(payloadToSend); // Espera a que finalice
      }

      if (user?.role === "Admin") {
        const clientsData = await getAllClients();
        setClientes(clientsData);
        saveClientesToLocalStorage(clientsData); // Opcional: actualizar localStorage si es relevante para Admin
      } else if (user?.role === "SalesPerson" && user._id) {
        const clientsData = await getClientsBySalesPerson(user._id);
        setClientes(clientsData);
        saveClientesToLocalStorage(clientsData); // Opcional: actualizar localStorage si es relevante para SalesPerson
      } else {
        // Si se usa localStorage, actualizarlo
        const localClients = loadClientesFromLocalStorage();
        // Y recargar desde localStorage
        setClientes(localClients);
      }
      // --- FIN FORZAR RECARGA ---

      setIsModalOpen(false);
    } catch (err: any) {
      alert(
        err.message || "No se pudo guardar el cliente. Intente nuevamente."
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando Clientes...</p>
        </div>
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 ">
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
        {/* Search buscar clientes */}

                <div className="w-full order-3 md:order-1 md:flex-1 md:mx-8 md:block hidden mb-8">
                  <div className="relative w-full max-w-[600px] mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <IoSearchOutline />
                    </div>
                    <ClientSearch
                      clientes={clientes}
                      onResults={(results) => setFilteredClientes(results)}
                    />
                  </div>
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
            const priceCategoryName = cliente.priceCategory?.name || "Sin categoría";

              // --- Extraer Departamento y Ciudad ---
            let departamento = "Sin departamento";
            let ciudad = "Sin ciudad";

            if (typeof cliente.city === 'object' && cliente.city && cliente.city._id) {
               // Si city es un objeto, extraer nombre de ciudad y departamento
               ciudad = cliente.city.name || "Sin ciudad";
               if (cliente.city.department && typeof cliente.city.department === 'object' && cliente.city.department.name) {
                  departamento = cliente.city.department.name;
               }
            } else if (typeof cliente.city === 'string' && cliente.city) {
               // Si city es solo un string (ID o nombre), asumir es el nombre de la ciudad
               // No podemos saber el departamento sin hacer otra llamada
               ciudad = cliente.city;
               // departamento sigue siendo "Sin departamento"
            }
            // --- FIN EXTRACCIÓN ---

            return (
              <Card
                key={cliente.id}
                className="bg-white hover:shadow-md transition-shadow border border-gray-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {cliente.name} {cliente.lastName}
                      </CardTitle>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        Nit: {cliente.id}
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
                          priceCategoryName.toLowerCase().includes("vip")
                            ? "default"
                            : "secondary"
                        }
                      >
                        {priceCategoryName}
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
                      
                      {/* --- BOTÓN DE ACTIVAR/DESACTIVAR --- */}
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleState(cliente)}
                          disabled={loadingToggle === cliente._id}
                          className={cliente.state === "activo" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          {loadingToggle === cliente._id ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              <span>Cambiando...</span>
                            </div>
                          ) : cliente.state === "activo" ? (
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span>Desactivar</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Activar</span>
                            </div>
                          )}
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
                  {/* Departamento */}
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{departamento}</span>
                  </div>

                  {/* Ciudad */}
                  <div className="flex items-center gap-2">
                    <MapPinned className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{ciudad}</span>
                  </div>

                  {/* Dirección */}
                  <div className="flex items-center gap-2">
                    <MapPinHouse className="w-4 h-4 text-gray-500" />
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

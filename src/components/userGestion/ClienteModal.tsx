// src/components/userGestion/ClienteModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  VendedorSelectContent,
} from "@/components/ui/SelectUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Cliente, Vendedor, Role, City, Department } from "@/interfaces/user.interface";
import { getPriceCategories } from "@/services/priceCategory.service";
import { ChevronDown, UserRound } from "lucide-react";
import { getDepartments, getCitiesByDepartment } from "@/services/client.service";



interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => Promise<void>;
  cliente?: Cliente | null;
  vendedores: Vendedor[];
}

export default function ClienteModal({
  isOpen,
  onClose,
  onSave,
  cliente,
  vendedores,
}: ClienteModalProps) {

  type ExtendedCliente = Cliente & { departmentId: string; cityId: string };

  const [formData, setFormData] = useState<ExtendedCliente>({
    id: "",
    name: "",
    lastName: "",
    password: "",
    emails: [{ EmailAddres: "", IsPrincipal: true }],
    phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
    address: [""],
    city: "", 
    departmentId: "", 
    cityId: "",       
    role: "Client",
    priceCategoryId: "",
    salesPersonId: "",
    state: "activo",
  });

  // Cambiar tipo de errores para incluir departmentId y cityId
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- ESTADOS PARA DEPARTAMENTOS Y CIUDADES ---
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<{_id: string; name: string}[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  //  Saber si el modal está en modo edición
  const isEditing = !!cliente?._id;
  // --- FIN ESTADOS ---

  // es de la lista de precios de categoria
  const [priceCategories, setPriceCategories] = useState<{id: string; name: string}[]>([]);

  // --- NUEVO: Estado temporal para el Select de Ciudad ---
  const [selectCityId, setSelectCityId] = useState<string>("");
  // --- FIN NUEVO ---

  // Cargar departamentos y categorías una sola vez al montar el componente
  useEffect(() => {
    let isMounted = true; // Bandera para evitar actualizaciones si el componente se desmonta

    const fetchData = async () => {
      setLoadingDepartments(true);
      try {
        const [deptData, pcData] = await Promise.all([
          getDepartments(),
          getPriceCategories(),
        ]);
        if (isMounted) { // Solo actualizar si sigue montado
          setDepartments(deptData);
          setPriceCategories(pcData);
        }
      } catch (err) {
        if (isMounted) { // Solo actualizar si sigue montado
          console.error("Error al cargar departamentos o categorías de precios", err);
          setDepartments([]);
          setPriceCategories([]);
        }
      } finally {
        if (isMounted) { // Solo actualizar si sigue montado
          setLoadingDepartments(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Montar solo una vez

  // --- NUEVO: useEffect para cargar ciudades cuando cambia formData.departmentId ---
  useEffect(() => {
    if (!formData.departmentId) {
      setCities([]);
      // Si se limpia el departamento, limpiar también la ciudad
      if (formData.cityId) {
          setFormData((prev) => ({ ...prev, cityId: "" }));
      }
      return;
    }

    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const cityList = await getCitiesByDepartment(formData.departmentId);
        const normalizedCities = cityList.map((c) => ({ _id: c._id, name: c.name }));
        setCities(normalizedCities);

      } catch (err) {
        console.error("Error al cargar ciudades:", err);
        setCities([]);
        // Opcional: Limpiar cityId si falla la carga
        setFormData((prev) => ({ ...prev, cityId: "" }));
      } finally {
        setLoadingCities(false);
      }
    };
    loadCities();
  }, [formData.departmentId]);
  // --- FIN NUEVO ---

  // --- NUEVO: useEffect para sincronizar selectCityId con formData.cityId solo si está en la lista de ciudades cargadas ---
useEffect(() => {
  if (!loadingCities && cities.length > 0 && formData.cityId) {
    const cityExists = cities.some((c) => c._id === formData.cityId);

    if (cityExists) {
      // Solo actualizar el estado del Select si la ciudad está disponible
      setSelectCityId(formData.cityId);
    } else {
      // Si no está, limpiar el Select
      setSelectCityId("");
    }
  } else if (loadingCities || cities.length === 0) {
    // Si las ciudades aún se están cargando o están vacías, limpiar el Select temporal
    setSelectCityId("");
  }
}, [formData.cityId, cities, loadingCities]);

  
  //  Función para normalizar los datos del cliente del backend
  const normalizeClientData = (clientData: any): ExtendedCliente => {
    console.log("🔄 Normalizando cliente:", clientData);

    // Función helper para extraer IDs de diferentes formatos
    const extractId = (value: any): string => {
    if (!value) return "";
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
    return value.toString();
  };

  // Extraer cityId y departmentId del objeto city del backend
    let cityId = "";
    let departmentId = "";
    if (typeof clientData.city === 'object' && clientData.city && clientData.city._id) {
       cityId = clientData.city._id;
       if (clientData.city.department && typeof clientData.city.department === 'object' && clientData.city.department._id) {
          departmentId = clientData.city.department._id;
       }
    } else if (typeof clientData.city === 'string') {
       // Si city es solo un string, asumimos es el ID de la ciudad
       cityId = clientData.city;
       // departmentId no se puede extraer si solo tenemos el ID de la ciudad
    }

    // Extraer priceCategory: Priorizar priceCategoryId en raíz, luego extra
  let priceCategoryId = "";
  if (clientData.priceCategoryId) {
    priceCategoryId = extractId(clientData.priceCategoryId);
  } else if (clientData.extra?.priceCategoryId) {
    priceCategoryId = extractId(clientData.extra.priceCategoryId);
  } else if (clientData.priceCategory) {
    priceCategoryId = extractId(clientData.priceCategory);
  }

    //  Extraer salesPerson - MANEJAR AMBOS FORMATOS  
    let salesPersonId = "";
  if (clientData.salesPersonId) {
    salesPersonId = extractId(clientData.salesPersonId);
  } else if (clientData.extra?.salesPerson?.id) {
    salesPersonId = extractId(clientData.extra.salesPerson.id);
  } else if (clientData.salesPerson) {
    salesPersonId = extractId(clientData.salesPerson);
  }

    console.log("PriceCategory extraído:", priceCategoryId);
    console.log("SalesPerson extraído:", salesPersonId);

    console.log("City ID extraído:", cityId);
    console.log("Department ID extraído:", departmentId);

    //  Extraer email correctamente (manejar diferentes formatos)
    let emails: Cliente['emails'] = [{ EmailAddres: "", IsPrincipal: true }];
  if (clientData.emails && Array.isArray(clientData.emails) && clientData.emails.length > 0) {
    const firstEmail = clientData.emails[0];
    emails = [{
      EmailAddres: firstEmail.EmailAddress || firstEmail.EmailAddres || "",
      IsPrincipal: firstEmail.IsPrincipal ?? firstEmail.isPrincipal ?? true
    }];
  } else if (clientData.email) {
    emails = [{ EmailAddres: clientData.email, IsPrincipal: true }];
  }

    //  Extraer teléfono correctamente
     let phones: Cliente['phones'] = [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }];
  if (clientData.phones && Array.isArray(clientData.phones) && clientData.phones.length > 0) {
    const firstPhone = clientData.phones[0];
    phones = [{
      NumberPhone: firstPhone.NumberPhone || "",
      Indicative: firstPhone.Indicative || "+57",
      IsPrincipal: firstPhone.IsPrincipal ?? firstPhone.isPrincipal ?? true
    }];
  } else if (clientData.phone) {
    phones = [{ NumberPhone: clientData.phone, Indicative: "+57", IsPrincipal: true }];
  }

    // Extraer dirección correctamente
    let address: string[] = [""];
  if (Array.isArray(clientData.address)) {
    address = clientData.address;
  } else if (clientData.address) {
    address = [clientData.address];
  }


    // Normalizar estado
    const state = clientData.state === "Active" ? "activo" : 
                  clientData.state === "Inactive" ? "inactivo" : 
                  clientData.state || "activo";

    const normalizedClient: ExtendedCliente = {
      _id: clientData._id || "",
      id: clientData.id || "",
      name: clientData.name || "",
      lastName: clientData.lastName || "",
      password: "", // Nunca mostrar contraseña
      emails,
      phones,
      address,
      city: clientData.city || "", // Mantener el valor original para enviarlo si no se modifica
      departmentId, // Campo interno
      cityId,       // Campo interno
      role: clientData.role || "Client",
      priceCategoryId,
      salesPersonId,
      state,
    };


  console.log("Cliente normalizado completo (ExtendedCliente):", normalizedClient);
  return normalizedClient;
};


  // useEffect para manejar apertura/cierre del modal y carga de cliente
  useEffect(() => {
    if (isOpen) {
      if (isEditing && cliente) {
        // Normalizar los datos del cliente (ahora devuelve ExtendedCliente)
        const normalizedClient = normalizeClientData(cliente);
        // Cargar datos en formData. El useEffect de departmentId se encargará de cargar ciudades.
        setFormData(normalizedClient);
      } else {
        // Solo resetear campos específicos, mantener departmentId y cityId vacíos
        setFormData((prev) => ({
          ...prev,
          id: "",
          name: "",
          lastName: "",
          password: "",
          emails: [{ EmailAddres: "", IsPrincipal: true }],
          phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
          address: [""],
          city: "",
          departmentId: "", // <-- Limpiar departamento
          cityId: "",       // <-- Limpiar ciudad
          priceCategoryId: "",
          salesPersonId: "",
          state: "activo",
        }));
        setCities([]); // Limpiar ciudades al resetear
      }
      setErrors({});
      setApiError(null);
    }
    // No dependencias específicas aquí, se ejecuta cuando isOpen cambia
  }, [isOpen, cliente]); // Añadir cliente a las dependencias para que se actualice si cambia el cliente mientras está abierto


// --- ACTUALIZAR validateForm ---
  const validateForm = (): boolean => {
     const newErrors: Partial<Record<string, string>> = {};

    if (!formData.id.trim()) newErrors.id = "la cedula es requerido";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";

    const email = formData.emails[0]?.EmailAddres;
    if (!email) newErrors.emails = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.emails = "Email inválido";

    const phone = formData.phones[0]?.NumberPhone;
    if (!phone) newErrors.phones = "El teléfono es requerido";
    else if (!/^[0-9]{7,15}$/.test(phone))
      newErrors.phones = "Teléfono inválido";

    // --- VALIDACIÓN DE CIUDAD (AHORA cityId) ---
    if (!formData.cityId) newErrors.cityId = "La ciudad es requerida";
    // --- FIN VALIDACIÓN ---

    if (!formData.priceCategoryId)
      newErrors.priceCategoryId = "La categoría de precio es requerida";
    
    // --- VALIDACIÓN DE CONTRASEÑA MODIFICADA ---
    if (!cliente?._id && !cliente?.id) { // Si es nuevo cliente
      if (!formData.password.trim()) newErrors.password = "La contraseña es requerida";
      else if (formData.password.length < 6)
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else { // Si es edición
      // Solo validar si se ingresó algo y es muy corto
      if (formData.password && formData.password.trim() && formData.password.length < 6) {
        newErrors.password = "La nueva contraseña debe tener al menos 6 caracteres";
      }
      // Si formData.password está vacío o solo espacios, y es edición, NO se agrega error
    }
    // --- FIN VALIDACIÓN DE CONTRASEÑA ---
    
    if (!formData.salesPersonId)
      newErrors.salesPersonId = "Debe asignar un vendedor";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = <K extends keyof ExtendedCliente>(
    field: K,
    value: ExtendedCliente[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    

    // Limpiar error del campo
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      const { departmentId, cityId, ...clienteParaGuardar } = formData;
      const clientToSave: Cliente = {
        ...clienteParaGuardar,
        city: cityId, // Usar cityId como el valor de city
        state: clienteParaGuardar.state || "activo",
      };

      console.log("📤 Guardando cliente:", clientToSave);
      await onSave(clientToSave);
      onClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setApiError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-full sm:max-w-[600px] bg-white px-4 py-6 sm:px-8 sm:py-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {cliente ? "Editar" : "Nuevo"} Cliente
            </DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID */}
          <div className="space-y-2">
            <Label>Cedula *</Label>
            <Input
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className={errors.id ? "border-red-500" : ""}
              disabled={!!cliente}
            />
            {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.emails[0]?.EmailAddres || formData.emails?.[0]?.EmailAddress || ""}
              onChange={(e) =>
                handleChange("emails", [
                  { ...formData.emails[0], EmailAddres: e.target.value,
                    IsPrincipal: true },
                ])
              }
              className={errors.emails ? "border-red-500" : ""}
            />
            {errors.emails && (
              <p className="text-red-500 text-sm">{errors.emails}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label>Teléfono *</Label>
            <div className="flex gap-2">
              <div className="w-24">
                <Select
                  value={formData.phones[0]?.Indicative || "+57"}
                  onValueChange={(value) =>
                    handleChange("phones", [
                      { ...formData.phones[0], Indicative: value },
                    ])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="+57" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+57">+57 (CO)</SelectItem>
                    <SelectItem value="+1">+1 (US)</SelectItem>
                    <SelectItem value="+52">+52 (MX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                value={formData.phones[0]?.NumberPhone || ""}
                onChange={(e) =>
                  handleChange("phones", [
                    { ...formData.phones[0], NumberPhone: e.target.value },
                  ])
                }
                className={`flex-1 ${errors.phones ? "border-red-500" : ""}`}
                placeholder="3112345678"
              />
            </div>
            {errors.phones && (
              <p className="text-red-500 text-sm">{errors.phones}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input
              value={formData.address[0] || ""}
              onChange={(e) => handleChange("address", [e.target.value])}
            />
          </div>

          {/* Departamento */}
          <div className="space-y-2 relative z-50">
            <Label>Departamento *</Label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => handleChange("departmentId", value)}
            >
              <SelectTrigger
                className={`mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 
                focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm 
                ${errors.departmentId ? "border border-red-500" : ""}`}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}
              >
                <div className="flex items-center gap-3 pr-6">
                  <SelectValue placeholder="Seleccionar departamento" />
                </div>
              </SelectTrigger>

              <SelectContent
                className="w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ maxHeight: "80px" }}
              >
                <SelectScrollUpButton />
                {loadingDepartments ? (
                  <SelectItem value="__loading_dept__" disabled>
                    Cargando...
                  </SelectItem>
                ) : (
                  departments.map((dept) => (
                    <SelectItem
                      key={dept._id}
                      value={dept._id}
                      className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                    >
                      {dept.name}
                    </SelectItem>
                  ))
                )}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>

            {errors.departmentId && (
              <p className="text-red-500 text-sm">{errors.departmentId}</p>
            )}
          </div>

          {/* Ciudad */}
          <div className="space-y-2 relative z-50">
            <Label>Ciudad *</Label>
            <Select
              value={selectCityId} // <-- AQUÍ ESTÁ EL CAMBIO
              onValueChange={(value) => {
                 // Actualiza también formData.cityId cuando cambia el Select
                 handleChange("cityId", value);
                 // Y el estado temporal
                 setSelectCityId(value);
              }}
              disabled={!formData.departmentId || loadingCities}
            >
              <SelectTrigger
                className={`mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 
                focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm 
                ${errors.cityId ? "border border-red-500" : ""}`}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}
              >
                <div className="flex items-center gap-3 pr-6">
                  <SelectValue
                    // 👇 Cambia la condición para usar selectCityId
                    placeholder={
                      !formData.departmentId
                        ? "Seleccione un departamento"
                        : loadingCities
                        ? "Cargando ciudades..."
                        : cities.length === 0
                        ? "No hay ciudades disponibles"
                        : !selectCityId // <-- AQUÍ ESTÁ EL CAMBIO
                        ? "Seleccionar ciudad"
                        : "Ciudad seleccionada" // O puedes mostrar el nombre si lo tienes en otro estado
                    }
                  />
                </div>
              </SelectTrigger>

              <SelectContent
                className="w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ maxHeight: "80px" }}
              >
                <SelectScrollUpButton />
                {loadingCities ? (
                  <SelectItem value="__loading_city__" disabled>
                    Cargando ciudades...
                  </SelectItem>
                ) : cities.length === 0 ? (
                  <SelectItem value="__no_cities__" disabled>
                    No hay ciudades disponibles
                  </SelectItem>
                ) : (
                  cities.map((city) => (
                    <SelectItem
                      key={city._id}
                      value={city._id}
                      className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                    >
                      {city.name}
                    </SelectItem>
                  ))
                )}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>

            {errors.cityId && (
              <p className="text-red-500 text-sm">{errors.cityId}</p>
            )}
          </div>


          {/* Categoría de Precio */}
        <div className="space-y-2 relative z-50">
          <Label>Categoría de Precio *</Label>
          <Select
            value={formData.priceCategoryId || ""}
            onValueChange={(value) => handleChange("priceCategoryId", value)}
          >
            <SelectTrigger 
                className="mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 
                        outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <div className="flex items-center gap-3 pr-6">
                <SelectValue placeholder="Seleccionar categoría de precio" />
              </div>
            </SelectTrigger>
            <SelectContent className="w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1
                outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ 
                  maxHeight: '80px',
                }}
              >
                <SelectScrollUpButton />
              {priceCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                      >
                  {cat.name}
                </SelectItem>
              ))}
              <SelectScrollDownButton />
            </SelectContent>
          </Select>
          {errors.priceCategoryId && (
            <p className="text-red-500 text-sm">{errors.priceCategoryId}</p>
          )}
        </div>


          {/* Asignar Vendedor */}
          <div className="space-y-2 relative z-50">
            <Label>Vendedor Asignado *</Label>
            <Select
              value={formData.salesPersonId || ""}
              onValueChange={(value) => handleChange("salesPersonId", value)
            }
            >
              <SelectTrigger 
                className="mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 
                        outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                
                <div className="flex items-center gap-3 pr-6">

                <SelectValue placeholder="Seleccionar vendedor" />
              </div>
    
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1
                outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ 
                  maxHeight: '110px',
                }}
              >
                <SelectScrollUpButton />
                {vendedores.map((vendedor) => {
                  const vendedorId = vendedor._id || vendedor.id;
                  if (!vendedorId) return null;
                  
                  return (
                    <SelectItem key={vendedorId} value={vendedorId}
                    className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                      >
                      <div className="flex items-center">
              <UserRound className="h-5 w-5 shrink-0 rounded-full text-gray-700" />
              <span className="ml-3 block truncate font-normal group-aria-selected:font-semibold">
                {vendedor.name} {vendedor.lastName}
              </span>
            </div>
            
                    </SelectItem>
                  );
                })}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>
            {errors.salesPersonId && (
              <p className="text-red-500 text-sm">{errors.salesPersonId}</p>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-2 relative z-50">
            <Label>Estado</Label>
            <Select
              value={formData.state || "activo"}
              onValueChange={(value: "activo" | "inactivo") =>
                handleChange("state", value)
              }
            >
              <SelectTrigger 
                className="mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 
                        outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-32 w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 
                        outline-black/5 [--anchor-gap:4px] sm:text-sm">
                <SelectItem value="activo"
                className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                      >Activo</SelectItem>
                <SelectItem value="inactivo"className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                      >Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#F2B318] hover:bg-[#F4C048]"
              disabled={loading}
            >
              {loading ? "Guardando..." : cliente ? "Actualizar" : "Crear"}{" "}
              Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

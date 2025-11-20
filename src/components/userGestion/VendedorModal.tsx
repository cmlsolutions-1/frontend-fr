// src/components/userGestion/VendedorModal.tsx
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
} from "@/components/ui/SelectUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Vendedor, City, Department } from "@/interfaces/user.interface";
import { getDepartments, getCitiesByDepartment } from "@/services/client.service";
import { Eye, EyeOff } from "lucide-react";

interface VendedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vendedor: Vendedor) => Promise<void>;
  vendedor?: Vendedor | null;
}

export default function VendedorModal({
  isOpen,
  onClose,
  onSave,
  vendedor,
}: VendedorModalProps) {

  type ExtendedVendedor = Vendedor & { departmentId: string; cityId: string };


  const initialFormState: ExtendedVendedor = {
    id: "",
    name: "",
    lastName: "",
    password: "",
    emails: [{ EmailAddres: "", IsPrincipal: true }],
    phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
    address: [""],
    city: "", 
    departmentId: "",
    role: "SalesPerson",
    priceCategoryId: "",
    state: "activo",
    salesPersonId: "",
    clients: [],
    cityId: "",     
  };


  const [formData, setFormData] = useState<ExtendedVendedor>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

   // --- ESTADOS PARA DEPARTAMENTOS Y CIUDADES ---
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<{_id: string; name: string}[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  // --- FIN ESTADOS ---

  const [selectCityId, setSelectCityId] = useState<string>("");

  // --- VISUALIZAR CONTRASEÑA ---
  const [showPassword, setShowPassword] = useState(false);


  // Cargar departamentos una sola vez al montar el componente
  useEffect(() => {
    let isMounted = true; // Bandera para evitar actualizaciones si el componente se desmonta

    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const deptData = await getDepartments();
        if (isMounted) { // Solo actualizar si sigue montado
          setDepartments(deptData);
        }
      } catch (err) {
        if (isMounted) { // Solo actualizar si sigue montado

          setDepartments([]);
        }
      } finally {
        if (isMounted) { // Solo actualizar si sigue montado
          setLoadingDepartments(false);
        }
      }
    };

    fetchDepartments();

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
  // --- FIN NUEVO ---


  // useEffect para manejar apertura/cierre del modal y carga de vendedor
  useEffect(() => {
    if (isOpen) {
      if (vendedor) {
        // ✅ Normalizar los datos del vendedor (extraer departmentId y cityId)
        const normalizedVendedor = normalizeVendedorData(vendedor);
        // Cargar datos en formData. El useEffect de departmentId se encargará de cargar ciudades.
        setFormData(normalizedVendedor);
      } else {
        // Solo resetear campos específicos
        setFormData(initialFormState);
        setCities([]); // Limpiar ciudades al resetear
      }
      setErrors({});
      setApiError(null);
    }
    // No dependencias específicas aquí, se ejecuta cuando isOpen cambia
  }, [isOpen, vendedor]); // Añadir vendedor a las dependencias

// --- FUNCIÓN PARA NORMALIZAR DATOS DEL VENDEDOR ---
  const normalizeVendedorData = (vendedorData: any): ExtendedVendedor => {

    // Función helper para extraer IDs de diferentes formatos
    const extractId = (value: any): string => {
      if (!value) return "";
      if (typeof value === 'string') return value;
      if (value._id) return value._id.toString();
      if (value.id) return value.id.toString();
      return value.toString();
    };

    // Extraer cityId y departmentId del objeto city del backend (si aplica)
    let cityId = "";
    let departmentId = "";
    if (typeof vendedorData.city === 'object' && vendedorData.city && vendedorData.city._id) {
       cityId = vendedorData.city._id;
       if (vendedorData.city.department && typeof vendedorData.city.department === 'object' && vendedorData.city.department._id) {
          departmentId = vendedorData.city.department._id;
       }
    } else if (typeof vendedorData.city === 'string') {
       // Si city es solo un string, asumimos es el ID de la ciudad
       cityId = vendedorData.city;
       // departmentId no se puede extraer si solo tenemos el ID de la ciudad
    }

    //  Extraer email correctamente (manejar diferentes formatos)
    let emails: Vendedor['emails'] = [{ EmailAddres: "", IsPrincipal: true }];
    if (vendedorData.emails && Array.isArray(vendedorData.emails) && vendedorData.emails.length > 0) {
      const firstEmail = vendedorData.emails[0];
      emails = [{
        EmailAddres: firstEmail.EmailAddress || firstEmail.EmailAddres || "",
        IsPrincipal: firstEmail.IsPrincipal ?? firstEmail.isPrincipal ?? true
      }];
    } else if (vendedorData.email) {
      emails = [{ EmailAddres: vendedorData.email, IsPrincipal: true }];
    }

    //  Extraer teléfono correctamente
    let phones: Vendedor['phones'] = [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }];
    if (vendedorData.phones && Array.isArray(vendedorData.phones) && vendedorData.phones.length > 0) {
      const firstPhone = vendedorData.phones[0];
      phones = [{
        NumberPhone: firstPhone.NumberPhone || "",
        Indicative: firstPhone.Indicative || "+57",
        IsPrincipal: firstPhone.IsPrincipal ?? firstPhone.isPrincipal ?? true
      }];
    } else if (vendedorData.phone) {
      phones = [{ NumberPhone: vendedorData.phone, Indicative: "+57", IsPrincipal: true }];
    }

    // Extraer dirección correctamente
    let address: string[] = [""];
    if (Array.isArray(vendedorData.address)) {
      address = vendedorData.address;
    } else if (vendedorData.address) {
      address = [vendedorData.address];
    }

    // Normalizar estado
    const state = vendedorData.state === "Active" ? "activo" :
                  vendedorData.state === "Inactive" ? "inactivo" :
                  vendedorData.state || "activo";

    const normalizedVendedor: ExtendedVendedor = {
      _id: vendedorData._id || "",
      id: vendedorData.id || "",
      name: vendedorData.name || "",
      lastName: vendedorData.lastName || "",
      password: "", 
      emails,
      phones,
      address,
      city: vendedorData.city || "", // Mantener el valor original para enviarlo si no se modifica
      departmentId, // Campo interno
      cityId,       // Campo interno
      role: vendedorData.role || "SalesPerson",
      priceCategoryId: vendedorData.priceCategoryId || "",
      salesPersonId: vendedorData.salesPersonId || "",
      state,
      clients: vendedorData.clients || [], // Asegurar que clients sea un array
    };

    return normalizedVendedor;
  };
  // --- FIN FUNCIÓN ---





  const validateForm = () => {
    const newErrors: Record<string, string> = {};

  

    if (!formData.id.trim()) newErrors.id = "El ID es requerido";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";

    const emailValue = formData.emails?.[0]?.EmailAddres?.trim() || formData.emails?.[0]?.EmailAddress?.trim();

    if (!emailValue) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      // Opcional: Validar formato del email
      newErrors.email = "Email inválido";
    }
    const phone = formData.phones[0]?.NumberPhone;
    if (!phone) newErrors.phone = "El teléfono es requerido";

    if (!formData.cityId) newErrors.cityId = "La ciudad es requerida";
    
    if (!vendedor?._id && !vendedor?.id) { 
      if (!formData.password.trim()) newErrors.password = "La contraseña es requerida";
      else if (formData.password.length < 6)
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else { // Si es edición
      if (formData.password && formData.password.trim() && formData.password.length < 6) {
        newErrors.password = "La nueva contraseña debe tener al menos 6 caracteres";
      }
      // Si formData.password está vacío y es edición, NO se agrega error
    }
    // --- FIN VALIDACIÓN DE CONTRASEÑA ---
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  const handleChange = <K extends keyof ExtendedVendedor>(
    field: K,
    value: ExtendedVendedor[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    // --- VALIDACIÓN PRINCIPAL ---
    if (!validateForm()) {
      return; // Detener la ejecución si hay errores
    }
    // --- FIN VALIDACIÓN ---

    // Asegurar que el email esté en minúsculas y sin espacios (solo si no está vacío, lo cual ya validamos)
    const cleanedEmails = formData.emails?.[0] ? [
        {
          EmailAddres: (formData.emails[0].EmailAddres || formData.emails[0].EmailAddress)?.trim().toLowerCase() || "",
          IsPrincipal: true,
        },
      ] : []; // Si está vacío (aunque validateForm debería haberlo impedido), usar array vacío o el original

      const { departmentId, cityId, ...vendedorParaGuardar } = formData; // Excluir campos internos

    // Preparar datos finales con el formato exacto
    // Asegúrate de incluir _id si es edición, para que updateVendedor lo use
    const vendedorToSave: Vendedor = {
      // Incluir _id y id originales si es edición
      ...(vendedor && (vendedor._id || vendedor.id) && { _id: vendedor._id, id: vendedor.id }),
      ...vendedorParaGuardar, // Incluir el resto de formData sin los campos internos
      id: formData.id || crypto.randomUUID(), // Usar id existente o generar uno nuevo
      emails: cleanedEmails,
      phones: [
        {
          NumberPhone:
            formData.phones[0]?.NumberPhone?.replace(/\D/g, "") || "",
          Indicative: formData.phones[0]?.Indicative || "+57",
          IsPrincipal: true,
        },
      ],
      address: [formData.address[0] || ""],
      city: cityId, // Usar cityId como el valor de city
      state: formData.state || "activo",
    };

    setLoading(true);
    setApiError(null); // Limpiar errores anteriores
    try {
      await onSave(vendedorToSave);
      onClose();
    } catch (error) {

      // Asumiendo que `onSave` (en VendedoresManager) lanza el error correctamente
      setApiError(
        error instanceof Error
          ? error.message
          : "Error desconocido al guardar el vendedor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto w-full sm:max-w-[600px] bg-white px-4 py-6 sm:px-8 sm:py-8 rounded-xl">
        <DialogHeader>
          <DialogTitle>{vendedor ? "Editar" : "Nuevo"} Vendedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

          {/* ID */}
          <div className="space-y-2">
            <Label>Cedula *</Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className={errors.id ? "border-red-500" : ""}
            />
            {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                id="name"
                name="name"
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
                id="lastName"
                name="lastName"
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
              id="email"
              name="email"
              value={formData.emails[0]?.EmailAddres || formData.emails?.[0]?.EmailAddress || ""}
              onChange={(e) =>
                handleChange("emails", [
                  { ...formData.emails[0], EmailAddres: e.target.value },
                ])
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label>Teléfono *</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phones[0]?.NumberPhone || ""}
              onChange={(e) =>
                handleChange("phones", [
                  { ...formData.phones[0], NumberPhone: e.target.value },
                ])
              }
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label>Contraseña *</Label>

            {/* Contenedor con posición relativa para el icono */}
            <div className="relative"> 
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={`${errors.password ? "border-red-500" : ""} pr-10`} 
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              </div>

            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input
              id="address"
              name="address"
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
                className="w-[--radix-select-trigger-width] rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ maxHeight: "160px", overflowY: "auto" }}
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
                      className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-black focus:outline-hidden"
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
              value={selectCityId}
              onValueChange={(value) => {
                 handleChange("cityId", value);
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
                    placeholder={
                      !formData.departmentId
                        ? "Seleccione un departamento"
                        : loadingCities
                        ? "Cargando ciudades..."
                        : cities.length === 0
                        ? "No hay ciudades disponibles"
                        : !selectCityId
                        ? "Seleccionar ciudad"
                        : "Ciudad seleccionada" 
                    }
                  />
                </div>
              </SelectTrigger>

              <SelectContent
                className="w-[--radix-select-trigger-width] rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5 [--anchor-gap:4px] sm:text-sm"
                style={{ maxHeight: "160px", overflowY: "auto" }}
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
                      className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-black focus:outline-hidden"
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

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.state}
              onValueChange={(value) =>
                handleChange("state", value as "activo" | "inactivo")
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
                <SelectItem value="activo"className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-black focus:outline-hidden"
                      >Activo</SelectItem>
                <SelectItem value="inactivo"className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-black focus:outline-hidden"
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
              {loading ? "Guardando..." : vendedor ? "Actualizar" : "Crear"}{" "}
              Vendedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

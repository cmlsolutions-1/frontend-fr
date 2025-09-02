// src/components/userGestion/ClienteModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
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
import { Cliente, Vendedor, Role } from "@/interfaces/user.interface";
import { getPriceCategories } from "@/services/priceCategory.service";
import { ChevronDown, UserRound } from "lucide-react";


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
  const [formData, setFormData] = useState<Cliente>({
    id: "",
    name: "",
    lastName: "",
    password: "",
    emails: [{ EmailAddres: "", IsPrincipal: true }],
    phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
    address: [""],
    city: "",
    role: "Client",
    priceCategory: "",
    salesPerson: "",
    state: "activo",
    extra: { priceCategoryId: "", salesPerson: { id: "" } },
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // es de la lista de precios de categoria
  const [priceCategories, setPriceCategories] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPriceCategories();
        setPriceCategories(data);
      } catch (err) {
        console.error("No se pudieron cargar categorías de precios", err);
      }
    };
    fetchData();
  }, []);
  
  // ✅ Función para normalizar los datos del cliente del backend
  const normalizeClientData = (clientData: any): Cliente => {
    console.log("🔄 Normalizando cliente:", clientData);

    // ✅ DEBUG ESPECÍFICO para todos los campos posibles
    console.log("🔍 salesPersonId:", clientData.salesPersonId);
    console.log("🔍 priceCategoryId:", clientData.priceCategoryId);
    console.log("🔍 extra.salesPerson:", clientData.extra?.salesPerson);
    console.log("🔍 extra.priceCategoryId:", clientData.extra?.priceCategoryId);
    console.log("🔍 extra object:", clientData.extra);

    // ✅ Función helper para extraer IDs de diferentes formatos
    const extractId = (value: any): string => {
        if (!value) return "";
        if (typeof value === 'string') return value;
        if (value._id) return value._id.toString();
        if (value.id) return value.id.toString();
        return value.toString();
    };

    // ✅ Extraer priceCategory - MANEJAR AMBOS FORMATOS
    let priceCategory = "";
    if (clientData.priceCategoryId) {
        priceCategory = extractId(clientData.priceCategoryId);
    } else if (clientData.extra?.priceCategoryId) {
        priceCategory = extractId(clientData.extra.priceCategoryId);
    } else if (clientData.priceCategory) {
        priceCategory = extractId(clientData.priceCategory);
    }

    // ✅ Extraer salesPerson - MANEJAR AMBOS FORMATOS  
    let salesPerson = "";
    if (clientData.salesPersonId) {
        salesPerson = extractId(clientData.salesPersonId);
    } else if (clientData.extra?.salesPerson?.id) {
        salesPerson = extractId(clientData.extra.salesPerson.id);
    } else if (clientData.extra?.salesPerson) {
        salesPerson = extractId(clientData.extra.salesPerson);
    } else if (clientData.salesPerson) {
        salesPerson = extractId(clientData.salesPerson);
    }

    console.log("✅ PriceCategory extraído:", priceCategory);
    console.log("✅ SalesPerson extraído:", salesPerson);

    // ✅ Extraer email correctamente (manejar diferentes formatos)
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

    // ✅ Extraer teléfono correctamente
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

    // ✅ Extraer dirección correctamente
    let address: string[] = [""];
    if (Array.isArray(clientData.address)) {
        address = clientData.address;
    } else if (clientData.address) {
        address = [clientData.address];
    }

    // ✅ Normalizar estado
    const state = clientData.state === "Active" ? "activo" : 
                  clientData.state === "Inactive" ? "inactivo" : 
                  clientData.state || "activo";

    const normalizedClient: Cliente = {
        _id: clientData._id || "",
        id: clientData.id || "",
        name: clientData.name || "",
        lastName: clientData.lastName || "",
        password: "",
        emails,
        phones,
        address,
        city: clientData.cityId || clientData.city || "",
        role: clientData.role || "Client",
        priceCategory, // ✅ Usar el valor extraído
        salesPerson,   // ✅ Usar el valor extraído
        state,
    };

    console.log("✅ Cliente normalizado COMPLETO:", normalizedClient);
    console.log("📧 Email:", normalizedClient.emails[0]?.EmailAddres);
    console.log("👤 Vendedor:", normalizedClient.salesPerson);
    console.log("💰 Categoría:", normalizedClient.priceCategory);
    
    return normalizedClient;
};


  useEffect(() => {
    console.log("🔄 useEffect - cliente recibido:", cliente);
    console.log("🔄 useEffect - isOpen:", isOpen);


  if (cliente && isOpen) {
    // ✅ Normalizar los datos del cliente
    const normalizedClient = normalizeClientData(cliente);
    setFormData(normalizedClient);

  } else {
    // ✅ Resetear formulario para nuevo cliente
    setFormData({
      id: "",
      name: "",
      lastName: "",
      password: "",
      emails: [{ EmailAddres: "", IsPrincipal: true }],
      phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
      address: [""],
      city: "",
      role: "Client",
      priceCategory: "",
      salesPerson: "",
      state: "activo",
    });
  }

  setErrors({});
  setApiError(null);
}, [cliente, isOpen]);


  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Cliente, string>> = {};

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

    if (!formData.city) newErrors.city = "La ciudad es requerida";
    if (!formData.priceCategory)
      newErrors.priceCategory = "La categoría de precio es requerida";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es requerida";
    if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    if (!formData.salesPerson)
      newErrors.salesPerson = "Debe asignar un vendedor";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = <K extends keyof Cliente>(
    field: K,
    value: Cliente[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    

    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
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
      // ✅ Preparar datos para enviar al backend con nombres correctos
      const clientToSave: Cliente = {
        ...formData,
        state: formData.state || "activo",
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

          {/* Ciudad */}
          <div className="space-y-2">
            <Label>Ciudad *</Label>
            <Input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>

          {/* Categoría de Precio */}
        <div className="space-y-2 relative z-50">
          <Label>Categoría de Precio *</Label>
          <Select
            value={formData.priceCategory || ""}
            onValueChange={(value) => handleChange("priceCategory", value)}
          >
            <SelectTrigger 
                className="mt-2 block w-full cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 
                        outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                  <div className="flex items-center gap-3 pr-6">
                <SelectValue placeholder="Seleccionar categoría de precio" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-32 w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 
                        outline-black/5 [--anchor-gap:4px] sm:text-sm">
              {priceCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
                      >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priceCategory && (
            <p className="text-red-500 text-sm">{errors.priceCategory}</p>
          )}
        </div>


          {/* Asignar Vendedor */}
          <div className="space-y-2 relative z-50">
            <Label>Vendedor Asignado *</Label>
            <Select
              value={formData.salesPerson || ""}
              onValueChange={(value) => handleChange("salesPerson", value)
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
              <SelectContent className="max-h-32 w-[--radix-select-trigger-width] overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline-1 
                        outline-black/5 [--anchor-gap:4px] sm:text-sm">
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
              </SelectContent>
            </Select>
            {errors.salesPerson && (
              <p className="text-red-500 text-sm">{errors.salesPerson}</p>
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

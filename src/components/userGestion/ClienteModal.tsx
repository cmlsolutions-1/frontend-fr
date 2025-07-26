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
import { saveClient } from "@/services/client.service";

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
    emails: [{ emailAddress: "", isPrincipal: true }],
    phones: [{ numberPhone: "", indicative: "+57", isPrincipal: true }],
    address: [""],
    city: "",
    role: "Client",
    priceCategory: "",
    salesPerson: "",
    state: "activo",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  

  const handleSaveCliente = () => {
    console.log("handleSaveCliente recibió:", formData);
    const vendedor = vendedores.find(
      (v) => (v._id ?? v.id) === formData.salesPerson
    );
  
    if (!vendedor) {
      console.error("Debe asignar un vendedor válido al cliente.");
      // Muestra mensaje al usuario si quieres
      return;
    }
  
    const clienteData = {
      ...formData,
      salesPerson: vendedor._id ?? vendedor.id, // 👈 Esto es lo que espera tu backend
    };
  
    console.log("Creando nuevo cliente. Payload:", clienteData);
  
    saveClient(clienteData)
      .then((res) => {
        console.log("Cliente guardado:", res);
        // mostrar toast de éxito, cerrar modal, etc.
      })
      .catch((err) => {
        console.error("Error al guardar cliente:", err);
        // mostrar toast de error si es necesario
      });
  };
  

/*   // Cargar cliente para edición
  useEffect(() => {
    if (cliente && isOpen) {
      const vendedorAsignado = vendedores.find(
        (v) => (v._id ?? v.id) === cliente.salesPerson // cliente.salesPerson tiene el id (cédula)
    );
    
      setFormData({
        ...cliente,
        emails:
          cliente.emails && cliente.emails.length > 0
            ? cliente.emails
            : [{ emailAddress: "", isPrincipal: true }],
        phones:
          cliente.phones && cliente.phones.length > 0
            ? cliente.phones
            : [{ numberPhone: "", indicative: "+57", isPrincipal: true }],
        address: cliente.address && cliente.address.length > 0 ? cliente.address
            : [""],
            salesPerson: vendedorAsignado?._id ?? vendedorAsignado?.id ?? "",
      });
    } else {
      setFormData({
        id: "",
        name: "",
        lastName: "",
        password: "",
        emails: [{ emailAddress: "", isPrincipal: true }],
        phones: [{ numberPhone: "", indicative: "+57", isPrincipal: true }],
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
  }, [cliente, isOpen, vendedores]); */

  useEffect(() => {
  if (cliente && isOpen) {
    // Normalizar identificadores
    const vendedoresNormalizados = vendedores.map((v) => ({
      ...v,
      _id: v._id || v.id, // Asegura que _id esté presente
    }));

    const vendedorAsignado = vendedoresNormalizados.find(
      (v) => v._id === cliente.salesPerson
    );

    setFormData({
      ...cliente,
      emails:
        cliente.emails && cliente.emails.length > 0
          ? cliente.emails
          : [{ emailAddress: "", isPrincipal: true }],
      phones:
        cliente.phones && cliente.phones.length > 0
          ? cliente.phones
          : [{ numberPhone: "", indicative: "+57", isPrincipal: true }],
      address: cliente.address && cliente.address.length > 0 ? cliente.address : [""],
      salesPerson: vendedorAsignado?._id || "",
    });
  } else {
    setFormData({
      id: "",
      name: "",
      lastName: "",
      password: "",
      emails: [{ emailAddress: "", isPrincipal: true }],
      phones: [{ numberPhone: "", indicative: "+57", isPrincipal: true }],
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
}, [cliente, isOpen, vendedores]);


  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof Cliente, string>> = {};

    if (!formData.id.trim()) newErrors.id = "El ID es requerido";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";

    const email = formData.emails[0]?.emailAddress;
    if (!email) newErrors.emails = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.emails = "Email inválido";

    const phone = formData.phones[0]?.numberPhone;
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

    // Corrección para el error de tipo
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
      await onSave({
        ...formData,
        state: formData.state || "activo",
      });
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
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar" : "Nuevo"} Cliente</DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID */}
          <div className="space-y-2">
            <Label>ID *</Label>
            <Input
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className={errors.id ? "border-red-500" : ""}
              disabled={!!cliente}
            />
            {errors.id && <p className="text-red-500 text-sm">{errors.id}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
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
              value={formData.emails[0]?.emailAddress || ""}
              onChange={(e) =>
                handleChange("emails", [
                  { ...formData.emails[0], emailAddress: e.target.value },
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
                  value={formData.phones[0]?.indicative || "+57"}
                  onValueChange={(value) =>
                    handleChange("phones", [
                      { ...formData.phones[0], indicative: value },
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
                value={formData.phones[0]?.numberPhone || ""}
                onChange={(e) =>
                  handleChange("phones", [
                    { ...formData.phones[0], numberPhone: e.target.value },
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
          <div className="space-y-2">
            <Label>Categoría de Precio *</Label>
            <Input
              value={formData.priceCategory}
              onChange={(e) => handleChange("priceCategory", e.target.value)}
              className={errors.priceCategory ? "border-red-500" : ""}
            />
            {errors.priceCategory && (
              <p className="text-red-500 text-sm">{errors.priceCategory}</p>
            )}
          </div>

          {/* Asignar Vendedor */}
          <div className="space-y-2">
            <Label>Vendedor Asignado *</Label>
            <Select
              value={formData.salesPerson || ""}
              onValueChange={(value) => handleChange("salesPerson", value)
            }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar vendedor" />
              </SelectTrigger>
              <SelectContent>
              {vendedores.map((v, i) => {
                  const key = v._id ?? v.id;
                  if (!key) {
                    console.warn(`Vendedor sin identificador válido en índice ${i}:`, v);
                    return null;
                  }
                  return (
                    <SelectItem key={String(key)} value={String(key)}>
                      {v.name} {v.lastName}
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
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.state || "activo"}
              onValueChange={(value: "activo" | "inactivo") =>
                handleChange("state", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
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

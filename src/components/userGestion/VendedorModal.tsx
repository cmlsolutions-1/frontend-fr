// src/components/userGestion/VendedorModal.tsx
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
import { Vendedor } from "@/interfaces/user.interface";

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
  const initialFormState: Vendedor = {
    id: "",
    name: "",
    lastName: "",
    password: "",
    emails: [{ EmailAddres: "", IsPrincipal: true }],
    phones: [{ NumberPhone: "", Indicative: "+57", IsPrincipal: true }],
    address: [""],
    city: "",
    role: "SalesPerson",
    priceCategory: "",
    state: "activo",
    salesPerson: "",
    clients: [],
  };

  const [formData, setFormData] = useState<Vendedor>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (vendedor) {
      setFormData(vendedor);
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setApiError(null);
  }, [vendedor, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = "El ID es requerido";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.lastName.trim())
      newErrors.lastName = "El apellido es requerido";

    const email = formData.emails[0]?.EmailAddres;
    if (!formData.emails?.[0]?.EmailAddres?.trim()) {
      setErrors({ ...errors, email: "El email es obligatorio" });
      return;
    }

    const phone = formData.phones[0]?.NumberPhone;
    if (!phone) newErrors.phone = "El teléfono es requerido";

    if (!formData.city) newErrors.city = "La ciudad es requerida";
    if (!formData.priceCategory)
      newErrors.priceCategory = "La categoría de precio es requerida";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = <K extends keyof Vendedor>(
    field: K,
    value: Vendedor[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación mejorada del email
    if (
      !formData.emails ||
      formData.emails.length === 0 ||
      !formData.emails[0].EmailAddres
    ) {
      setErrors((prev) => ({ ...prev, email: "El email es requerido" }));
      return;
    }

    // Asegurar que el email esté en minúsculas y sin espacios
    const cleanedEmails = formData.emails.map((email) => ({
      EmailAddres: email.EmailAddres.trim().toLowerCase(),
      IsPrincipal: email.IsPrincipal,
    }));

    // Preparar datos finales con el formato exacto
    const vendedorToSave: Vendedor = {
      ...formData,
      id: formData.id || crypto.randomUUID(),
      emails: [
        {
          EmailAddres: formData.emails[0].EmailAddres.trim(),
          IsPrincipal: true,
        },
      ],
      phones: [
        {
          NumberPhone:
            formData.phones[0]?.NumberPhone?.replace(/\D/g, "") || "",
          Indicative: formData.phones[0]?.Indicative || "+57",
          IsPrincipal: true,
        },
      ],
      address: [formData.address[0] || ""],
      state: formData.state || "activo",
    };

    setLoading(true);
    try {
      await onSave(vendedorToSave);
      onClose();
    } catch (error) {
      console.error("Error completo:", error);
    setApiError(error.message);
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
            <Input
              id="password"
              name="password"
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
              id="address"
              name="address"
              value={formData.address[0] || ""}
              onChange={(e) => handleChange("address", [e.target.value])}
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-2">
            <Label>Ciudad *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}
          </div>

          {/* Categoría de precio */}
          {/* <div className="space-y-2">
            <Label>Categoría de precio *</Label>
            <Input
              id="priceCategory"
              name="priceCategory"
              value={formData.priceCategory}
              onChange={(e) => handleChange("priceCategory", e.target.value)}
              className={errors.priceCategory ? "border-red-500" : ""}
            />
            {errors.priceCategory && (
              <p className="text-red-500 text-sm">{errors.priceCategory}</p>
            )}
          </div> */}

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
                <SelectItem value="activo"className="group/option relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none focus:bg-[#F2B318] focus:text-white focus:outline-hidden"
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
              {loading ? "Guardando..." : vendedor ? "Actualizar" : "Crear"}{" "}
              Vendedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

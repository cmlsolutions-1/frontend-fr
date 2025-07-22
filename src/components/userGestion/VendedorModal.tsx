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
    email: [{ EmailAddres: "", IsPrincipal: true }],
    phone: [{ NumberPhone: "", Indicative: "57", IsPrincipal: true }],
    addres: [""],
    city: "",
    role: "SalesPerson", // o "Admin" si es necesario
    priceCategory: "",
    estado: "activo",
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

    const email = formData.email[0]?.EmailAddres;
    if (!email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email inválido";

    const phone = formData.phone[0]?.NumberPhone;
    if (!phone) newErrors.phone = "El teléfono es requerido";

    if (!formData.city) newErrors.city = "La ciudad es requerida";
    if (!formData.priceCategory)
      newErrors.priceCategory = "La categoría de precio es requerida";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    field: keyof Vendedor,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let updatedFormData = { ...formData };

    if (!updatedFormData.id || updatedFormData.id.trim() === "") {
      updatedFormData.id = crypto.randomUUID(); // Asignar ID nuevo
    }

    if (validateForm()) {
      setLoading(true);
      try {
        await onSave(updatedFormData); // Enviar datos con ID garantizado
        setFormData(initialFormState);
        setErrors({});
        setApiError(null);
        onClose();
      } catch (err) {
        console.error("Error al guardar vendedor:", err);
        setApiError("Error al guardar el vendedor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{vendedor ? "Editar" : "Nuevo"} Vendedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

          {/* ID */}
          <div className="space-y-2">
            <Label>ID *</Label>
            <Input
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className={errors.id ? "border-red-500" : ""}
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
              value={formData.email[0].EmailAddres}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  email: [{ ...prev.email[0], EmailAddres: e.target.value }],
                }))
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
              value={formData.phone[0].NumberPhone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: [{ ...prev.phone[0], NumberPhone: e.target.value }],
                }))
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
              value={formData.addres[0]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  addres: [e.target.value],
                }))
              }
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SalesPerson">Vendedor</SelectItem>
                <SelectItem value="Admin">Administrador</SelectItem>
                <SelectItem value="Client">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ciudad y Categoría de precio */}
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Categoría de precio *</Label>
              <Input
                value={formData.priceCategory}
                onChange={(e) => handleChange("priceCategory", e.target.value)}
                className={errors.priceCategory ? "border-red-500" : ""}
              />
              {errors.priceCategory && (
                <p className="text-red-500 text-sm">{errors.priceCategory}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => handleChange("estado", value)}
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
              {loading ? "Guardando..." : vendedor ? "Actualizar" : "Crear"}{" "}
              Vendedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { Vendedor } from "@/components/userGestion/types";

interface VendedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    vendedor: Omit<Vendedor, "fechaIngreso" | "ventasDelMes">
  ) => Promise<void>;
  vendedor?: Vendedor | null;
}

export default function VendedorModal({
  isOpen,
  onClose,
  onSave,
  vendedor,
}: VendedorModalProps) {
  const [formData, setFormData] = useState<
    Omit<Vendedor, "fechaIngreso" | "ventasDelMes">
  >({
    id: "",
    name: "",
    lastName: "",
    email: [""],
    phone: [{ indicative: "+57", numberPhone: "" }],
    address: [
      {
        city: { id: "1", name: "" },
        country: { id: "1", name: "Colombia" },
        postalCode: "",
      },
    ],
    password: "",
    role: "vendedor",
    isPrincipal: false,
    isActive: true,
    apellido: "",
    telefono: "",
    territorio: "",
    comision: 5.0,
    estado: "activo",
  });

  const initialFormState: Omit<Vendedor, "fechaIngreso" | "ventasDelMes"> = {
    id: "",
    name: "",
    lastName: "",
    email: [""],
    phone: [{ indicative: "+57", numberPhone: "" }],
    address: [
      {
        city: { id: "1", name: "" },
        country: { id: "1", name: "Colombia" },
        postalCode: "",
      },
    ],
    password: "",
    role: "vendedor",
    isPrincipal: false,
    isActive: true,
    apellido: "",
    telefono: "",
    territorio: "",
    comision: 5.0,
    estado: "activo",
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const territorios = [
    "Zona Norte",
    "Zona Sur",
    "Zona Centro",
    "Zona Oriente",
    "Zona Occidente",
    "Nacional",
  ];

  useEffect(() => {
    if (vendedor) {
      const { fechaIngreso, ventasDelMes, ...rest } = vendedor;
      setFormData(rest);
    } else {
      setFormData({
        id: "",
        name: "",
        lastName: "",
        email: [""],
        phone: [{ indicative: "+57", numberPhone: "" }],
        address: [
          {
            city: { id: "1", name: "" },
            country: { id: "1", name: "Colombia" },
            postalCode: "",
          },
        ],
        password: "",
        role: "vendedor",
        isPrincipal: false,
        isActive: true,
        apellido: "",
        telefono: "",
        territorio: "",
        comision: 5.0,
        estado: "activo",
      });
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
    if (!formData.email[0]?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email[0])) {
      newErrors.email = "El email no es válidos";
    }
    if (!formData.telefono.trim())
      newErrors.telefono = "El teléfono es requerido";
    if (!formData.territorio.trim())
      newErrors.territorio = "El territorio es requerido";
    if (formData.comision < 0 || formData.comision > 100) {
      newErrors.comision = "La comisión debe estar entre 0 y 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSave(formData); // <- Espera a que el guardado termine
        setFormData(initialFormState); // <- Limpia el formulario si quieres
        setErrors({});
        setApiError(null);
        onClose(); // <- Cierra el modal solo si todo fue bien
      } catch (err) {
        console.error("Error al guardar:", err);
        setApiError("No se pudo guardar el vendedor.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white shadow-lg rounded-md">
        <DialogHeader>
          <DialogTitle>
            {vendedor ? "Editar Vendedor" : "Nuevo Vendedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <p className="text-red-600 text-sm">{apiError}</p>}

          {/* ID */}
          <div className="space-y-2">
            <Label htmlFor="id">ID *</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Ingresa el ID"
              className={errors.id ? "border-red-500" : ""}
            />
            {errors.id && <p className="text-sm text-red-500">{errors.id}</p>}
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            {["nombre", "apellido"].map((f) => (
              <div key={f} className="space-y-2">
                <Label htmlFor={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} *
                </Label>
                <Input
                  id={f}
                  value={formData[f as keyof typeof formData] as string}
                  onChange={(e) =>
                    handleInputChange(
                      f as keyof typeof formData,
                      e.target.value
                    )
                  }
                  placeholder={`Ingresa el ${f}`}
                  className={errors[f] ? "border-red-500" : ""}
                />
                {errors[f] && (
                  <p className="text-sm text-red-500">{errors[f]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              value={formData.email[0] || ""}
              onChange={(e) => {
                const updatedEmails = [...formData.email];
                updatedEmails[0] = e.target.value;
                setFormData((prev) => ({ ...prev, email: updatedEmails }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: "" }));
                }
              }}
              placeholder="ejemplo@correo.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              placeholder="Número de teléfono"
              className={errors.telefono ? "border-red-500" : ""}
            />
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono}</p>
            )}
          </div>
          {/* Territorio y Comisión */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="territorio">Territorio *</Label>
              <Select
                value={formData.territorio}
                onValueChange={(value) =>
                  handleInputChange("territorio", value)
                }
              >
                <SelectTrigger
                  className={errors.territorio ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Selecciona territorio" />
                </SelectTrigger>
                <SelectContent>
                  {territorios.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.territorio && (
                <p className="text-sm text-red-500">{errors.territorio}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comision">Comisión (%) *</Label>
              <Input
                id="comision"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.comision}
                onChange={(e) =>
                  handleInputChange("comision", Number(e.target.value))
                }
                placeholder="5.0"
                className={errors.comision ? "border-red-500" : ""}
              />
              {errors.comision && (
                <p className="text-sm text-red-500">{errors.comision}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) =>
                handleInputChange("estado", value as "activo" | "inactivo")
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
              {loading ? "Guardando..." : vendedor ? "Actualizar" : "Crear"}{" "}
              Vendedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

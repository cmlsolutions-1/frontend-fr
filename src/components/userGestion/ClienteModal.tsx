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
import { Cliente, Vendedor, Phone, Address, City, Country } from "@/interfaces/user.interface";

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, "fechaRegistro">) => void;
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
  const [formData, setFormData] = useState<Omit<Cliente, "fechaRegistro">>({
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
    role: "cliente",
    isPrincipal: false,
    isActive: true,
    tipoCliente: "VIP",
    vendedorId: "",
    estado: "activo",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        ...cliente,
        email: cliente.email.length ? cliente.email : [""],
        phone: cliente.phone.length ? cliente.phone : [{ indicative: "+57", numberPhone: "" }],
        address: cliente.address.length
          ? cliente.address
          : [
              {
                city: { id: "1", name: "" },
                country: { id: "1", name: "Colombia" },
                postalCode: "",
              },
            ],
      });
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
        role: "cliente",
        isPrincipal: false,
        isActive: true,
        tipoCliente: "VIP",
        vendedorId: "",
        estado: "activo",
      });
    }
    setErrors({});
  }, [cliente, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) newErrors.id = "El ID es requerido";
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido";

    if (!formData.email[0]?.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email[0])) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.phone[0]?.numberPhone?.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    }

    if (!formData.address[0]?.city?.name?.trim()) {
      newErrors.ciudad = "La ciudad es requerida";
    }

    if (!formData.address[0]?.postalCode?.trim()) {
      newErrors.direccion = "El código postal es requerido";
    }

    if (!formData.vendedorId.trim()) newErrors.vendedorId = "El vendedor es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Omit<Cliente, "fechaRegistro">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white shadow-lg rounded-md">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ID */}
          <InputGroup
            label="ID *"
            value={formData.id}
            onChange={(val) => handleInputChange("id", val)}
            error={errors.id}
          />

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="Nombre *"
              value={formData.name}
              onChange={(val) => handleInputChange("name", val)}
              error={errors.name}
            />
            <InputGroup
              label="Apellido *"
              value={formData.lastName}
              onChange={(val) => handleInputChange("lastName", val)}
              error={errors.lastName}
            />
          </div>

          {/* Email */}
          <InputGroup
            label="Email *"
            value={formData.email[0]}
            onChange={(val) => handleInputChange("email", [val])}
            error={errors.email}
          />

          {/* Teléfono */}
          <InputGroup
            label="Teléfono *"
            value={formData.phone[0].numberPhone}
            onChange={(val) =>
              handleInputChange("phone", [{ ...formData.phone[0], numberPhone: val }])
            }
            error={errors.telefono}
          />

          {/* Ciudad */}
          <InputGroup
            label="Ciudad *"
            value={formData.address[0].city.name}
            onChange={(val) =>
              handleInputChange("address", [
                {
                  ...formData.address[0],
                  city: { ...formData.address[0].city, name: val },
                },
              ])
            }
            error={errors.ciudad}
          />

          {/* Código Postal (como dirección genérica) */}
          <InputGroup
            label="Código Postal *"
            value={formData.address[0].postalCode}
            onChange={(val) =>
              handleInputChange("address", [
                { ...formData.address[0], postalCode: val },
              ])
            }
            error={errors.direccion}
          />

          {/* Tipo de cliente */}
          <div className="space-y-2">
            <Label>Tipo de Cliente *</Label>
            <Select
              value={formData.tipoCliente}
              onValueChange={(value: "VIP" | "SAS") =>
                handleInputChange("tipoCliente", value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="SAS">SAS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendedor */}
          <div className="space-y-2">
            <Label>Asignar Vendedor *</Label>
            <Select
              value={formData.vendedorId}
              onValueChange={(value) => handleInputChange("vendedorId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} {v.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendedorId && (
              <p className="text-sm text-red-500">{errors.vendedorId}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary text-white hover:bg-primary-dark">
              {cliente ? "Actualizar" : "Crear"} Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente auxiliar para agrupar inputs y errores
const InputGroup = ({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={error ? "border-red-500" : ""}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

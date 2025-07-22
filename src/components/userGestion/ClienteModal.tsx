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
import { Cliente, Vendedor } from "@/interfaces/user.interface";

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, "fechaRegistro">) => Promise<void>;
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
    email: [{ EmailAddres: "", IsPrincipal: true }],
    phone: [{ NumberPhone: "", Indicative: "57", IsPrincipal: true }],
    addres: [""],
    city: "",
    password: "",
    role: "Client",
    priceCategory: "",
    salesPerson: "", // ID del vendedor asignado
    clients: [],
    tipoCliente: "VIP",
    estado: "activo",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar cliente para edición
  useEffect(() => {
    if (cliente && isOpen) {
      setFormData({
        ...cliente,
        email: cliente.email.length > 0 ? cliente.email : [{ EmailAddres: "", IsPrincipal: true }],
        phone: cliente.phone.length > 0 ? cliente.phone : [{ NumberPhone: "", Indicative: "57", IsPrincipal: true }],
        addres: cliente.addres.length > 0 ? cliente.addres : [""],
      });
    } else {
      setFormData({
        id: "",
        name: "",
        lastName: "",
        email: [{ EmailAddres: "", IsPrincipal: true }],
        phone: [{ NumberPhone: "", Indicative: "57", IsPrincipal: true }],
        addres: [""],
        city: "",
        password: "",
        role: "Client",
        priceCategory: "",
        salesPerson: "",
        clients: [],
        tipoCliente: "VIP",
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

    const email = formData.email[0]?.EmailAddres;
    if (!email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email inválido";

    const phone = formData.phone[0]?.NumberPhone;
    if (!phone) newErrors.phone = "El teléfono es requerido";

    if (!formData.city) newErrors.city = "La ciudad es requerida";
    if (!formData.priceCategory) newErrors.priceCategory = "La categoría de precio es requerida";
    if (!formData.password.trim()) newErrors.password = "La contraseña es requerida";
    if (!formData.salesPerson) newErrors.salesPerson = "Debe asignar un vendedor";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = <K extends keyof Omit<Cliente, "fechaRegistro">>(
    field: K,
    value: Omit<Cliente, "fechaRegistro">[K]
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

    let finalId = formData.id;
    if (!finalId || finalId.trim() === "") {
      finalId = crypto.randomUUID();
      handleChange("id", finalId);
    }

    if (validateForm()) {
      try {
        await onSave(formData);
        onClose();
      } catch (err) {
        console.error("Error al guardar cliente:", err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar" : "Nuevo"} Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Apellido *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              value={formData.email[0].EmailAddres}
              onChange={(e) =>
                handleChange("email", [
                  { ...formData.email[0], EmailAddres: e.target.value },
                ])
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label>Teléfono *</Label>
            <Input
              value={formData.phone[0].NumberPhone}
              onChange={(e) =>
                handleChange("phone", [
                  { ...formData.phone[0], NumberPhone: e.target.value },
                ])
              }
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
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
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          {/* Dirección (texto libre) */}
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input
              value={formData.addres[0]}
              onChange={(e) => handleChange("addres", [e.target.value])}
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
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>

          {/* Categoría de Precio */}
          <div className="space-y-2">
            <Label>Categoría de Precio *</Label>
            <Input
              value={formData.priceCategory}
              onChange={(e) => handleChange("priceCategory", e.target.value)}
              className={errors.priceCategory ? "border-red-500" : ""}
            />
            {errors.priceCategory && <p className="text-red-500 text-sm">{errors.priceCategory}</p>}
          </div>

          {/* Tipo de Cliente */}
          <div className="space-y-2">
            <Label>Tipo de Cliente *</Label>
            <Select
              value={formData.tipoCliente}
              onValueChange={(value: "VIP" | "SAS") => handleChange("tipoCliente", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP">VIP</SelectItem>
                <SelectItem value="SAS">SAS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asignar Vendedor */}
          <div className="space-y-2">
            <Label>Vendedor Asignado *</Label>
            <Select
              value={formData.salesPerson}
              onValueChange={(value) => handleChange("salesPerson", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} {v.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.salesPerson && <p className="text-red-500 text-sm">{errors.salesPerson}</p>}
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={formData.estado}
              onValueChange={(value: "activo" | "inactivo") => handleChange("estado", value)}
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
            >
              {cliente ? "Actualizar" : "Crear"} Cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
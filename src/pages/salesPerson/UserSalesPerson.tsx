// src/components/userGestion/UserSalesPerson.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mail, PhoneOutgoing, MapPin } from "lucide-react";
import { getClientsBySalesPerson } from "@/services/client.salesPerson";
import type { Cliente, Email, Phone, Role } from "@/interfaces/user.interface";

interface UserSalesPersonProps {
  currentSellerId: string; // El _id del vendedor logueado
}

export default function UserSalesPerson({ currentSellerId }: UserSalesPersonProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //  Normalizar clientes 
  const normalizeClients = (data: any[], currentSellerId: string): Cliente[] => {
  return data.map((item: any): Cliente => ({
    _id: item._id ?? "",
    id: item.id ?? crypto.randomUUID(),
    name: item.name ?? "",
    lastName: item.lastName ?? "",
    password: item.password ?? "",
    emails: [
      {
        EmailAddres: item.email ?? "Sin correo",
        IsPrincipal: true,
      },
    ],
    phones: [
      {
        NumberPhone: item.phone ?? "",
        Indicative: "+57",
        IsPrincipal: true,
      },
    ],
    address: item.address
      ? Array.isArray(item.address)
        ? item.address
        : [item.address]
      : ["Sin dirección"],
    city: item.city ?? "",
    role: (item.role as Role) ?? "Client",
    priceCategoryId: item.priceCategoryId ?? "",
    salesPersonId: item.salesPersonId ?? currentSellerId,
    clients: item.clients ?? [],
    state:
      item.state === "Active"
        ? "activo"
        : item.state === "Inactive"
        ? "inactivo"
        : (item.state as "activo" | "inactivo") ?? "activo",
  }));
};


  // 🧠 Cargar clientes del vendedor actual
  useEffect(() => {
    const loadClientes = async () => {
      if (!currentSellerId) {
        setError("No se pudo identificar al vendedor.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Cargando clientes para el vendedor con _id:", currentSellerId);
        const data = await getClientsBySalesPerson(currentSellerId);
        const normalized = normalizeClients(Array.isArray(data) ? data : [], currentSellerId);
        setClientes(normalized);
      } catch (err) {
        console.error("Error al cargar clientes del vendedor:", err);
        setError(
          err instanceof Error ? err.message : "No se pudieron cargar los clientes."
        );
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, [currentSellerId]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <p className="text-gray-600 text-lg">Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">
          Mis Clientes
        </h1>
      </div>

      {clientes.length === 0 ? (
        <p className="text-gray-500 text-center py-20 text-lg">
          No tienes clientes asignados.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => {
            const email =
              cliente.emails?.find((e) => e.IsPrincipal)?.EmailAddres ||
              "Sin correo";
            const phoneNumber =
              cliente.phones?.[0]?.NumberPhone || "Sin teléfono";
            const phoneIndicative = cliente.phones?.[0]?.Indicative || "+57";
            
            // const priceCategory = cliente.priceCategoryId || "Sin categoría";

            return (
              <Card
                key={cliente.id}
                className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-medium text-gray-800">
                        {cliente.name} {cliente.lastName}
                      </CardTitle>
                      <div className="text-xs font-mono text-gray-400 mt-1">
                        Nit: {cliente.id?.slice(0, 8) + "..."}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant={
                            cliente.state === "activo"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {cliente.state || "Sin estado"}
                        </Badge>
                        {/* <Badge
                          variant={
                            priceCategory === "VIP"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {priceCategory}
                        </Badge> */}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneOutgoing className="w-4 h-4 text-gray-500" />
                    <span className="truncate">
                      {phoneNumber === "Sin teléfono"
                        ? "Sin teléfono"
                        : `${phoneIndicative} ${phoneNumber}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

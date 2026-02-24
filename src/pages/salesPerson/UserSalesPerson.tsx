import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Mail, PhoneOutgoing, BadgeDollarSign, CheckCircle, XCircle } from "lucide-react";
import { getClientsBySalesPerson } from "@/services/client.salesPerson";
import type { Cliente, Role } from "@/interfaces/user.interface";
import { ClientSearch } from "@/components/ui/ClientSearch";
import { IoSearchOutline } from "react-icons/io5";

interface UserSalesPersonProps {
  currentSellerId: string; // El _id del vendedor logueado
}

export default function UserSalesPerson({ currentSellerId }: UserSalesPersonProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalizar clientes
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
      priceCategoryId: item.priceCategory?._id ?? item.priceCategoryId ?? "",
      priceCategory: item.priceCategory
        ? {
            _id: item.priceCategory._id ?? "",
            code: item.priceCategory.code ?? "",
            name: item.priceCategory.name ?? "Sin categoría",
          }
        : undefined,
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

  // Cargar clientes del vendedor actual
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

        const data = await getClientsBySalesPerson(currentSellerId);
        const normalized = normalizeClients(Array.isArray(data) ? data : [], currentSellerId);

        setClientes(normalized);
        setFilteredClientes(normalized); // ✅ importante: inicializar la lista visible
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes.");
        setClientes([]);
        setFilteredClientes([]);
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
    <div className="min-h-screen py-8 px-6 mt-[100px]">
      {/* Header */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 items-center gap-4">
  
  {/* Columna izquierda */}
  <div className="text-center md:text-left">
    <h1 className="text-3xl font-semibold text-gray-800">
      Mis Clientes
    </h1>
    <p className="text-sm text-gray-500 mt-1">
      {filteredClientes.length} cliente
      {filteredClientes.length !== 1 ? "s" : ""}
    </p>
  </div>

  {/* Columna centro (buscador centrado real) */}
  <div className="flex justify-center">
    <ClientSearch
      clientes={clientes}
      onResults={(results) => setFilteredClientes(results)}
    />
  </div>

  {/* Columna derecha vacía (para mantener el centro exacto) */}
  <div className="hidden md:block" />
</div>

      {/* Lista */}
      {filteredClientes.length === 0 ? (
        <p className="text-gray-500 text-center py-20 text-lg">
          No se encontraron clientes.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClientes.map((cliente) => {
            const email =
              cliente.emails?.find((e) => e.IsPrincipal)?.EmailAddres || "Sin correo";
            const phoneNumber = cliente.phones?.[0]?.NumberPhone || "Sin teléfono";
            const phoneIndicative = cliente.phones?.[0]?.Indicative || "+57";

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
                        {/* Estado */}
                        <Badge
                          variant={cliente.state === "activo" ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {cliente.state === "activo" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span className="capitalize">{cliente.state || "Sin estado"}</span>
                        </Badge>

                        {/* Categoría precio */}
                        {cliente.priceCategory && (
                          <Badge
                            variant={
                              cliente.priceCategory.name?.toLowerCase().includes("vip")
                                ? "default"
                                : "secondary"
                            }
                            className="flex items-center gap-1"
                          >
                            <BadgeDollarSign className="w-4 h-4 text-gray-500" />
                            {cliente.priceCategory.name || "Sin categoría"}
                          </Badge>
                        )}
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
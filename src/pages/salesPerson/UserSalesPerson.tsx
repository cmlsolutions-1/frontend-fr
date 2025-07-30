// src/components/userGestion/UserSalesPerson.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"; // Importar Card
import { Badge } from "@/components/ui/Badge"; // Importar Badge
import { Mail, Phone, MapPin } from "lucide-react"; // Importar iconos
import { getClientsBySalesPerson } from "@/services/client.salesPerson"; // Importar el servicio correcto
import type { Cliente } from "@/interfaces/user.interface"; // Importar Cliente
import { getClientsBySeller } from "@/services/client.service";
// import { useAuth } from "@/contexts/AuthContext"; // Ejemplo: si tienes contexto de autenticación

interface UserSalesPersonProps {
  currentSellerId: string; // El _id del vendedor logueado
}

export default function UserSalesPerson({ currentSellerId }: UserSalesPersonProps) {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  console.log("Clientes cargados para el vendedor:", clientes);
}, [clientes]);

useEffect(() => {
  console.log("🟢 currentSellerId recibido:", currentSellerId);
}, [currentSellerId]);

    // Cargar clientes del vendedor al montar el componente o cuando cambie el ID
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
        setClientes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar clientes del vendedor:", err);
        setError(err instanceof Error ? err.message : "No se pudieron cargar los clientes.");
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, [currentSellerId]); // Dependencia: currentSellerId

  function getPrimaryEmail(cliente: Cliente): string {
    if (!cliente.emails || !Array.isArray(cliente.emails) || cliente.emails.length === 0) return "Sin correo";
    const email = cliente.emails.find(e => e?.IsPrincipal) ?? cliente.emails[0];
    return email?.EmailAddress?.trim() || "Sin correo";
  }

  function getPrimaryPhone(cliente: Cliente): string {
    if (!cliente.phones || !Array.isArray(cliente.phones) || cliente.phones.length === 0) return "Sin teléfono";
    const phone = cliente.phones.find(p => p?.IsPrincipal) ?? cliente.phones[0];
    const indicative = phone?.Indicative || "";
    const number = phone?.NumberPhone || "";
    return indicative && number ? `${indicative} ${number}` : "Sin teléfono";
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Mis Clientes
        </h1>
        {/* Puedes agregar acciones aquí si es necesario */}
      </div>

      {/* Lista de Clientes */}
      {clientes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No tienes clientes asignados.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => {
            const email = getPrimaryEmail(cliente);
            const phoneNumber = getPrimaryPhone(cliente);
            const address = cliente.address?.[0] || "Sin dirección";
            const priceCategory = cliente.priceCategory || "Sin categoría";

            return (
              <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {cliente.name} {cliente.lastName}
                      </CardTitle>
                      <div className="text-sm font-mono text-gray-500 mt-1">
                        ID: {cliente.id?.slice(0, 8) + "..."}
                      </div>
                      <Badge
                        variant={cliente.state === "activo" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {cliente.state || "Sin estado"}
                      </Badge>
                      <Badge
                        variant={priceCategory === "VIP" ? "default" : "secondary"}
                        className="mt-1 ml-1"
                      >
                        {priceCategory}
                      </Badge>
                    </div>
                    {/* Puedes agregar acciones específicas por cliente si es necesario */}
                    {/* <div className="flex gap-1">
                      <Button variant="ghost" size="sm">Ver Detalle</Button>
                    </div> */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="truncate">{phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{address}</span>
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
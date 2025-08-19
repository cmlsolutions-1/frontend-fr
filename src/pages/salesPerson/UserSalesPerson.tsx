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
    return email?.EmailAddres?.trim() || "Sin correo";
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
        {/* Puedes agregar acciones aquí si es necesario */}
      </div>

      {/* Lista de Clientes */}
      {clientes.length === 0 ? (
        <p className="text-gray-500 text-center py-20 text-lg">
          No tienes clientes asignados.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => {
            const email = getPrimaryEmail(cliente);
            const phoneNumber = getPrimaryPhone(cliente);
            const address = cliente.address?.[0] || "Sin dirección";
            const priceCategory = cliente.priceCategory || "Sin categoría";

            return (
              <Card key={cliente.id} className="rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-medium text-gray-800">
                        {cliente.name} {cliente.lastName}
                      </CardTitle>
                      <div className="text-xs font-mono text-gray-400 mt-1">
                        ID: {cliente.id?.slice(0, 8) + "..."}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant={cliente.state === "activo" ? "default" : "secondary"}
                        
                      >
                        {cliente.state || "Sin estado"}
                      </Badge>
                      <Badge
                        variant={priceCategory === "VIP" ? "default" : "secondary"}
                        
                      >
                        {priceCategory}
                      </Badge>
                      </div>
                    </div>
                    {/* Puedes agregar acciones específicas por cliente si es necesario */}
                    {/* <div className="flex gap-1">
                      <Button variant="ghost" size="sm">Ver Detalle</Button>
                    </div> */}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <span className="truncate">{phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
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
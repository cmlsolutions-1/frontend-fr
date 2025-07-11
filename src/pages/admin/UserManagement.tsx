//src/pages/admin/UserManagement.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, UserCheck, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ClientesManager from "@/components/userGestion/ClientesManager";
import VendedoresManager from "@/components/userGestion/VendedoresManager";
import { Cliente, Vendedor } from "@/components/userGestion/types";
import { getVendedores, createVendedor } from "@/services/seller.service";
import { getClientsBySeller } from "@/services/client.service";

type ViewType = "home" | "clientes" | "vendedores";

const UserManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string | null>(null);


  // Cargar vendedores desde backend o fallback
  useEffect(() => {
    const loadVendedores = async () => {
      const data = await getVendedores();

      if (data.length === 0) {
        const defaultVendedores: Vendedor[] = [
          {
            id: "1",
            name: "Ana",
            lastName: "Martínez",
            apellido: "Martínez",
            email: ["ana.martinez@ferrelectricos.com"],
            phone: [],
            telefono: "3001234567",
            address: [],
            territorio: "Zona Norte",
            password: "",
            role: "vendedor",
            isPrincipal: true,
            isActive: true,
            comision: 5.5,
            ventasDelMes: 15,
            estado: "activo",
            fechaIngreso: "2023-06-15",
          },
          {
            id: "2",
            name: "Luis",
            lastName: "Hernández",
            apellido: "Hernández",
            email: ["luis.hernandez@ferrelectricos.com"],
            phone: [],
            telefono: "3107654321",
            address: [],
            territorio: "Zona Sur",
            password: "",
            role: "vendedor",
            isPrincipal: true,
            isActive: true,
            comision: 6.0,
            ventasDelMes: 0,
            estado: "activo",
            fechaIngreso: "2023-08-20",
          },
        ];
        setVendedores(defaultVendedores);
        localStorage.setItem("vendedores", JSON.stringify(defaultVendedores));
      } else {
        setVendedores(data);
      }
    };
    loadVendedores();
  }, []);

  // Cargar clientes cuando seleccionas un vendedor
  useEffect(() => {
    if (selectedVendedorId) {
      const loadClients = async () => {
        const data = await getClientsBySeller(selectedVendedorId);
        setClientes(data);
      };
      loadClients();
    }
  }, [selectedVendedorId]);

  // Guardar vendedores en localStorage mientras desarrollas
  useEffect(() => {
    localStorage.setItem("vendedores", JSON.stringify(vendedores));
  }, [vendedores]);

  const renderNavigation = () => (
    <div className="bg-gray-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-2">
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            onClick={() => setCurrentView("home")}
            className="text-sm"
          >
            Inicio
          </Button>
          <Button
            variant={currentView === "clientes" ? "default" : "ghost"}
            onClick={() => setCurrentView("clientes")}
            className="text-sm"
          >
            Clientes
          </Button>
          <Button
            variant={currentView === "vendedores" ? "default" : "ghost"}
            onClick={() => setCurrentView("vendedores")}
            className="text-sm"
          >
            Vendedores
          </Button>
        </div>
      </div>
    </div>
  );

  const renderHomeView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Aquí podrás administrar los usuarios del sistema.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView("clientes")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Gestión de Clientes</CardTitle>
            <CardDescription>
              Administra la información de tus clientes, crea nuevos registros y mantén actualizada su información.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setCurrentView("clientes")}>
              <Plus className="w-4 h-4 mr-2" />
              Gestionar Clientes
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView("vendedores")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Gestión de Vendedores</CardTitle>
            <CardDescription>
              Administra tu equipo de ventas, asigna territorios y mantén el control de tu fuerza comercial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setCurrentView("vendedores")}>
              <Plus className="w-4 h-4 mr-2" />
              Gestionar Vendedores
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "clientes":
        return <ClientesManager searchTerm={searchTerm} vendedores={vendedores} />;
      case "vendedores":
        return (
          <VendedoresManager
            searchTerm={searchTerm}
            setVendedores={setVendedores} // Prop para actualizar la lista de vendedores
          />
        );
      default:
        return renderHomeView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* {renderHeader()} */}
      {renderNavigation()}
      {renderContent()}
    </div>
  );
};

export default UserManagement;
//src/pages/admin/UserManagement.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Users, UserCheck, Plus, Search, MailCheck } from "lucide-react";
import ClientesManager from "@/components/userGestion/ClientesManager";
import VendedoresManager from "@/components/userGestion/VendedoresManager";
import { Cliente, Vendedor } from "@/components/userGestion/types";
import { getVendedores, createVendedor } from "@/services/seller.service";
import { getClientsBySeller } from "@/services/client.service";

import ValidateEmail from "@/components/userGestion/ValidateEmail";




type ViewType = "home" | "clientes" | "vendedores";

const UserManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [openValidateEmail, setOpenValidateEmail] = useState(false);
  const [selectedVendedorId, setSelectedVendedorId] = useState<string | null>(
    null
  );

  // Cargar vendedores desde backend o fallback
  useEffect(() => {
    const loadVendedores = async () => {
      const data = await getVendedores();

      if (data.length === 0) {
        const defaultVendedores: Vendedor[] = [];
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
    <div className="w-full mt-[110px]">
      <div className="flex gap-1 py-2 justify-center w-full">
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
  );

  const renderHomeView = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
      <div className="mb-8 ">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600">
          Aquí podrás administrar los usuarios del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        <Card
          className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView("clientes")}
        >
          <CardHeader className="text-center min-h-[220px]">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Gestión de Clientes</CardTitle>
            <CardDescription>
              Administra la información de tus clientes, crea nuevos registros y
              mantén actualizada su información.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => setCurrentView("clientes")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gestionar Clientes
            </Button>
          </CardContent>
        </Card>

        <Card
          className="bg-white hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setCurrentView("vendedores")}
        >
          <CardHeader className="text-center min-h-[220px]">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Gestión de Vendedores</CardTitle>
            <CardDescription>
              Administra tu equipo de ventas, asigna territorios y mantén el
              control de tu fuerza comercial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => setCurrentView("vendedores")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Gestionar Vendedores
            </Button>
          </CardContent>
        </Card>

        <Card
            className="bg-white hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
            onClick={() => setOpenValidateEmail(true)}
          >
            <CardHeader className="text-center min-h-[220px]">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <MailCheck className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Envio de Validacion email</CardTitle>
              <CardDescription>
                Aqui podras reenviar la validacion del email, si el usuario no lo hizo en el tiempo establecido.
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto">
              <Button className="w-full" onClick={() => setOpenValidateEmail(true)}>
                <MailCheck className="w-4 h-4 mr-2" />
                Validacion de email
              </Button>
            </CardContent>
          </Card>

      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "clientes":
        return (
          <ClientesManager searchTerm={searchTerm} vendedores={vendedores} />
        );
      case "vendedores":
        return (
          <VendedoresManager
          // searchTerm={searchTerm}
          // setVendedores={setVendedores} // Prop para actualizar la lista de vendedores
          />
        );
      default:
        return renderHomeView();
    }
  };

  

  return (
    <div className="min-h-screen">
      {/* {renderHeader()} */}
      {renderNavigation()}
      {renderContent()}

      <ValidateEmail 
      open={openValidateEmail}
      onClose={() => setOpenValidateEmail(false)}
    />
    </div>
  );
};

export default UserManagement;

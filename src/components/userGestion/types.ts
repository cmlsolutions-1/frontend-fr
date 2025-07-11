// Interfaz para el tipo Cliente
// src/components/userGestion/types.ts
import { Vendedor, Cliente } from "@/interfaces/user.interface";

export type { Vendedor, Cliente };

/* export interface Cliente {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    estado: "activo" | "inactivo"; // Estado del cliente
    tipoCliente: "VIP" | "SAS"; // Nuevo campo: Tipo de Cliente
    fechaRegistro: string; // Fecha de registro en formato ISO (YYYY-MM-DD)
    vendedorId?: string; // ID del vendedor asignado (opcional)
  }
  
  // Interfaz para el tipo Vendedor
  export interface Vendedor {
    id: string; // ID único generado automáticamente
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    territorio: string; // Territorio asignado al vendedor
    comision: number; // Comisión en porcentaje (0-100)
    estado: "activo" | "inactivo"; // Estado del vendedor
    fechaIngreso: string; // Fecha de ingreso en formato ISO (YYYY-MM-DD)
    ventasDelMes: number; // Ventas realizadas en el mes actual
  } */
// src/interfaces/seller.interface.ts
export interface Vendedor {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    territorio: string;
    comision: number;
    estado: "activo" | "inactivo";
    fechaIngreso: string; // ISO date
    ventasDelMes: number;
  }
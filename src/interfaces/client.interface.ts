// src/interfaces/client.interface.ts
export interface Cliente {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    estado: "activo" | "inactivo";
    tipoCliente: "VIP" | "SAS";
    vendedorId: string;
    fechaRegistro: string; // ISO date
  }
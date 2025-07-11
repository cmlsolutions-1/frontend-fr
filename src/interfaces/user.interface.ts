// src/interfaces/user.interface.ts
export interface User {
  id: string; // UUID
  name: string;
  lastName: string;
  email: string[]; // Array de correos electrónicos
  phone: Phone[];
  address: Address[];
  password: string;
  role: "admin" | "cliente" | "vendedor";
  isPrincipal: boolean;
  isActive: boolean;
}

export interface Phone {
  numberPhone: string;
  indicative: string;
}

export interface Address {
  city: City;
  country: Country;
  postalCode: string;
}

export interface City {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface Vendedor extends User {
  apellido: string;
  telefono: string;
  territorio: string;
  comision: number;
  ventasDelMes: number;
  estado: "activo" | "inactivo";
  fechaIngreso: string;
}

export interface Cliente extends User {
  tipoCliente: "VIP" | "SAS";
  vendedorId: string;
  fechaRegistro: string;
  estado: "activo" | "inactivo";
}
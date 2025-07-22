// src/interfaces/user.interface.ts
export type Role = "Admin" | "SalesPerson" | "Client";

export interface User {
  id: string;
  name: string;
  lastName: string;
  password: string;
  email: Email[];
  phone: Phone[];
  addres: string[];
  city: string; // solo el ID (como espera el backend)
  role: Role;
  priceCategory: string; // ID de categoría de precio
  salesPerson?: string;  // ID del vendedor si es cliente
  clients?: string[];    // IDs de clientes si es vendedor
}

export interface Email {
  EmailAddres: string;
  IsPrincipal: boolean;
}

export interface Phone {
  NumberPhone: string;
  IsPrincipal: boolean;
  Indicative: string;
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

export interface Vendedor {
  id?: string;
  name: string;
  lastName: string;
  email: { EmailAddres: string; IsPrincipal: boolean }[];
  phone: { NumberPhone: string; Indicative: string; IsPrincipal: boolean }[];
  addres: string[];
  city: string;
  password: string;
  role: string;
  priceCategory: string;
  estado?: string;
  salesPerson: string;
  clients: string[];
}


export interface Cliente extends User {
  tipoCliente: "VIP" | "SAS";
  fechaRegistro: string;
  estado: "activo" | "inactivo";
}
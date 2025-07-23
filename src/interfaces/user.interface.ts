// src/interfaces/user.interface.ts

export type Role = "Admin" | "SalesPerson" | "Client";

// === EMAIL ===
export interface Email {
  emailAddress: string;     // minúscula
  isPrincipal: boolean;
}

// === PHONE ===
export interface Phone {
  numberPhone: string;
  indicative: string;
  isPrincipal: boolean;
}

// === USER BASE ===
export interface User {
  _id?: string;
  id: string;
  name: string;
  lastName: string;
  password: string;
  emails: Email[];
  phones: Phone[];
  address: string[];        // singular, no "addres"
  city: string;
  role: Role;
  priceCategory: string;
  salesPerson?: string;
  clients?: string[];
  state?: "activo" | "inactivo";
}

// === VENDEDOR ===
export interface Vendedor extends User {}
export interface Cliente extends User {}


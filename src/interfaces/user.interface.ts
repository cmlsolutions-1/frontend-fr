// src/interfaces/user.interface.ts

export type Role = "Admin" | "SalesPerson" | "Client";

// === EMAIL ===
export interface Email {
  EmailAddres: string;
  EmailAddress?: string;     
  IsPrincipal: boolean;
}

// === PHONE ===
export interface Phone {
  NumberPhone: string;
  Indicative: string;
  IsPrincipal: boolean;
}

// === DEPARTMENT ===
export interface Department {
  _id: string;
  name: string;
  id?: string;
}

// === CITY ===
export interface City {
  _id: string;
  department: Department; 
  name: string;
  id?: string; 
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
  address: string[];        
  city: string | City;
  role: Role;
  priceCategoryId: string;
  salesPersonId?: string; 
  clients?: string[];
  state?: "activo" | "inactivo";
}

export interface PriceCategory {
  _id: string;
  code: string;
  name: string;
}

// === VENDEDOR ===
export interface Vendedor extends User {}
export interface Cliente extends User {
  priceCategory?: PriceCategory;
}


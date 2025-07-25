// src/interfaces/update-user.ts

import { Email, Phone } from "@/interfaces/user.interface";

export interface UpdateUserDto {
  id: string;
  name?: string;
  lastName?: string;
  emails?: Email[];
  phones?: Phone[];
  address?: string[];
  city?: string;
  priceCategory?: string;
  idSalesPerson?: string;         // 👈 obligatorio para el backend
  state?: "Active" | "Inactive";  // 👈 lo envías desde frontend como texto
}
// src/interfaces/cart.interface.ts
import type { Product } from './product.interface';

export interface CartItem extends Product {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug: string;

}

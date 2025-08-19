export interface Precio {
  precio: string;   // parece venir vacío, pero lo dejo como string
  valor: number;
  valorpos: number;
}

export interface Package {
  typePackage: string; // "Inner" | "Master"
  mount: number;
}

export interface Product {
  _id: string;
  referencia: string;
  codigo: string;
  detalle: string;
  subgategoryId: string;
  image: string;           // por ahora parece ser un id de imagen
  precios: Precio[];       // array de precios
  packages: Package[];     // array de presentaciones
  stock: number;
}

export interface CartProduct extends Product {
  quantity: number;
}
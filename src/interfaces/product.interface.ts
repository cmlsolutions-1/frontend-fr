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
  image: {
    _id: string;
    url: string;
    name: string;
    idCloud: string;
  };           
  precios: Precio[];      
  packages: Package[];     
  stock: number;
}

export interface CartProduct extends Product {
  quantity: number;
}
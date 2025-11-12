//src/interfaces/product.interface.ts

export interface Precio {
  precio: string;   // parece venir vacío, pero lo dejo como string
  valor: number;
  valorpos: number;
}

export interface Package {
  typePackage: string; // "Inner" | "Master"
  Mount: number;
}


export interface Brand {
  code: string;
  name: string;
}

export interface Product {
  _id: string;
  referencia: string;
  codigo: string;
  detalle: string;
  subgategory?: {
  _id: string;
  };
  image: {
    _id: string;
    url: string;
    name: string;
    idCloud: string;
  };           
  precios: Precio[];      
  packages?: Package[];
  stock: number;
  brand: Brand;
}



export interface CartProduct extends Product {
  quantity: number;
}

export interface ProductSummary {
  _id: string;
  reference?: string;
  description?: string;
}


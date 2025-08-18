//src/interfaces/product.interface.ts

export interface ProductImage {
  id: number;
  url: string;
  productId: string;
}

export interface Product {
  _id: string;
  referencia: string;
  codigo: string;
  detalle: string;
  subgategoryId: string;
  image: string;
  precios: any[]; // si quieres luego definimos bien la estructura de precios
}

export interface CartProduct {
  _id: string;
  referencia: string;
  codigo: string;
  detalle: string;
  subgategoryId: string;
  image: string;
  precios: any[];
  quantity: number;
}


export interface ProductImage {
  id: number;
  url: string;
  productId: string;
}


type Category = 'men'|'women'|'kid'|'unisex';
//export type Size = 'XS'|'S'|'M'|'L'|'XL'|'XXL'|'XXXL';
export type Type = 'bioseguridad'|'cadenas guayas y tensores'|'cerrajeria chapas y candados' | 'electronica' | 'escaleras' | 'herrajes' | 'herramienta electrica' | 'herramienta manual' |
    'iluminacion' | 'pinturas solventes' | 'seguridad industrial' | 'siliconas y adhesivos cintas' | 'tornilleria'
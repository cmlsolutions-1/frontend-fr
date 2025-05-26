export interface Product {
  id: string;
  description: string;
  images: string[];
  inStock: number;
  price: number;
  //sizes: Size[];
  slug: string;
  tags: string[];
  title: string;
  reference: string;
  code: string;
  master: number;
  inner: number;
  categoryId: string,
  //todo: type: Type;
  //gender: Category;
}

export interface CartProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  //size: Size;
  reference: string;
  code: string;
  master: number;
  inner: number;
  image: string;
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
// src/mocks/get-products-by-contenedor-id.ts

export const getProductsByContenedorId = async (contenedorId: number) => {
  // Simulación de datos
  const contenedores = [
    {
      id: 1,
      nombre: 'HS2024',
      products: [
        {
      id: '00526',
      title: 'CHAPA DIAMON CROMADA S/S GR RESTREPO',
      slug: 'chapa-diamon',
      description: 'CHAPA DIAMON CROMADA S/S GR RESTREPO',
      price: 10600,
      inStock: 8,
      tags: ['chapas'],
      reference: '00526',
      code: '588CD/SN',
      master: 30,
      inner: 1,
      categoryId: 'cerrajeria',
      ProductImage: [
        { id: 1, url: '00526.png' },
        { id: 2, url: '00526-1.png' },
      ]
    },
        {
      id: '04323',
      title: 'DIFERENCIAL/CATALINA 1 TONELADA  X 3 MTRS CADENA BEEGONA',
      slug: 'cadenas-guayas',
      description: 'DIFERENCIAL CATALINA DE 1 TONELADA  X 3 MTRS CADENA BEEGONA',
      price: 216000,
      inStock: 5,
      tags: ['guayas'],
      reference: '04323',
      code: 'TC-103',
      master: 1,
      inner: 1,
      categoryId: 'cadenas-guayas',
      ProductImage: [
        { id: 1, url: '04323.png' },
        { id: 2, url: '04323-1.png' },
      ]
    },
      ]
    },
    {
      id: 2,
      nombre: 'HS2025762',
      products: [
        {
      id: '06848',
      title: 'PINZA VOLTIAMPERIMETRICA MINI',
      slug: 'pinza-volte-mini',
      description: 'PINZA VOLTIAMPERIMETRICA MINI',
      price: 32700,
      inStock: 5,
      tags: ['pinzaVol'],
      reference: '06848',
      code: 'MT87',
      master: 4,
      inner: 1,
      categoryId: 'electronica',
      ProductImage: [
        { id: 1, url: '06848.png' },
        { id: 2, url: '06848-1.png' },
      ]
    },
    {
      id: '08355',
      title: 'TESTER DIGITAL AMARILLO BLISTER 1 PILA CUADRADA C/PITO FONTOR DT830D            ',
      slug: 'tester-digital',
      description: 'TESTER DIGITAL AMARILLO BLISTER 1 PILA CUADRADA C/PITO FONTOR DT830D            ',
      price: 15800,
      inStock: 5,
      tags: ['pinzaVol'],
      reference: '08355',
      code: '171037',
      master: 4,
      inner: 1,
      categoryId: 'electronica',
      ProductImage: [
        { id: 1, url: '08355.png' },
        { id: 2, url: '08355-1.png' },
      ]
    }
       ] // Otro contenedor
    }
  ];

  const contenedor = contenedores.find(c => c.id === contenedorId);

  if (!contenedor) return null;

  return {
    nombre: contenedor.nombre,
    products: contenedor.products.map((p: any) => ({
      ...p,
      images: p.ProductImage.map((img: any) => img.url), // transformamos ProductImage a images
    })),
  };
};
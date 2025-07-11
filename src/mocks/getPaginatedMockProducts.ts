export async function getPaginatedMockProductsWithImages({
  page = 1,
  gender,
}: {
  page: number;
  gender?: string;
}) {
  const allProducts = [
    {
      id: "00526",
      title: "CHAPA DIAMON CROMADA S/S GR RESTREPO",
      slug: "chapa-diamon",
      description: "CHAPA DIAMON CROMADA S/S GR RESTREPO",
      price: 10600,
      inStock: 8,
      tags: ["chapas"],
      reference: "00526",
      code: "588CD/SN",
      master: 30,
      inner: 1,
      categoryId: "cerrajeria",
      ProductImage: [
        { id: 1, url: "00526.png" },
        { id: 2, url: "00526-1.png" },
      ],
    },
    {
      id: "04323",
      title: "DIFERENCIAL/CATALINA 1 TONELADA  X 3 MTRS CADENA BEEGONA",
      slug: "cadenas-guayas",
      description:
        "DIFERENCIAL CATALINA DE 1 TONELADA  X 3 MTRS CADENA BEEGONA",
      price: 216000,
      inStock: 5,
      tags: ["guayas"],
      reference: "04323",
      code: "TC-103",
      master: 1,
      inner: 1,
      categoryId: "cadenas-guayas",
      ProductImage: [
        { id: 1, url: "04323.png" },
        { id: 2, url: "04323-1.png" },
      ],
    },
    {
      id: "06754",
      title: "CAJA FUERTE  (20X31X20 CM) DIGITAL",
      slug: "caja-fuerte",
      description: "CAJA FUERTE  (20X31X20 CM) DIGITAL",
      price: 164000,
      inStock: 5,
      tags: ["cajaFuerte"],
      reference: "06754",
      code: "FR-20EDA",
      master: 4,
      inner: 1,
      categoryId: "cerrajeria",
      ProductImage: [
        { id: 1, url: "06754.png" },
        { id: 2, url: "06754-1.png" },
      ],
    },
    {
      id: "06848",
      title: "PINZA VOLTIAMPERIMETRICA MINI",
      slug: "pinza-volte-mini",
      description: "PINZA VOLTIAMPERIMETRICA MINI",
      price: 32700,
      inStock: 5,
      tags: ["pinzaVol"],
      reference: "06848",
      code: "MT87",
      master: 4,
      inner: 1,
      categoryId: "electronica",
      ProductImage: [
        { id: 1, url: "06848.png" },
        { id: 2, url: "06848-1.png" },
      ],
    },
    {
      id: "08355",
      title:
        "TESTER DIGITAL AMARILLO BLISTER 1 PILA CUADRADA C/PITO FONTOR DT830D            ",
      slug: "tester-digital",
      description:
        "TESTER DIGITAL AMARILLO BLISTER 1 PILA CUADRADA C/PITO FONTOR DT830D            ",
      price: 15800,
      inStock: 5,
      tags: ["pinzaVol"],
      reference: "08355",
      code: "171037",
      master: 4,
      inner: 1,
      categoryId: "electronica",
      ProductImage: [
        { id: 1, url: "08355.png" },
        { id: 2, url: "08355-1.png" },
      ],
    },
    {
      id: "11043",
      title: "MALACATE CON MANIVELA  800 LBS  C/GUAYA IMPORTADO ",
      slug: "malacate-manivela-800",
      description: "MALACATE CON MANIVELA  800 LBS  C/GUAYA IMPORTADO ",
      price: 216000,
      inStock: 5,
      tags: ["malacate"],
      reference: "11043",
      code: "FR-W800LB",
      master: 1,
      inner: 1,
      categoryId: "cadenas-guayas",
      ProductImage: [
        { id: 1, url: "11043.png" },
        { id: 2, url: "11043-1.png" },
      ],
    },
    {
      id: "11236",
      title:
        "CONTROLADOR ELECTRONICO DE PRESION P/BOMBA AQUA PLUS 110V-240V EPS-01",
      slug: "controlador-electronico",
      description:
        "CONTROLADOR ELECTRONICO DE PRESION P/BOMBA AQUA PLUS 110V-240V EPS-01",
      price: 105000,
      inStock: 5,
      tags: ["controlador-electronico"],
      reference: "11236",
      code: "FR-EPS01",
      master: 1,
      inner: 1,
      categoryId: "herramienta_electrica",
      ProductImage: [
        { id: 1, url: "11236.png" },
        { id: 2, url: "11236-1.png" },
      ],
    },
    {
      id: "12466",
      title:
        "HERRAJE GAVINETE  SOFA CAMA CABECERO CLIP  10 CM (PAR) NEGRO                    ",
      slug: "herraje-gavinete",
      description:
        "HERRAJE GAVINETE  SOFA CAMA CABECERO CLIP  10 CM (PAR) NEGRO",
      price: 5700,
      inStock: 5,
      tags: ["herraje-gavinete-negro"],
      reference: "12466",
      code: "FR-HSEO1-BL",
      master: 50,
      inner: 1,
      categoryId: "herrajes",
      ProductImage: [
        { id: 1, url: "12466.png" },
        { id: 2, url: "12466-1.png" },
      ],
    },
    {
      id: "12467",
      title: "HERRAJE GAVINETE  SOFA CAMA CABECERO CLIP 10 CM (PAR) BLANCO",
      slug: "herraje-gavinete",
      description:
        "HERRAJE GAVINETE  SOFA CAMA CABECERO CLIP 10 CM (PAR) BLANCO",
      price: 5800,
      inStock: 5,
      tags: ["herraje-gavinete-blanco"],
      reference: "12467",
      code: "FR-HSEO2",
      master: 50,
      inner: 1,
      categoryId: "herrajes",
      ProductImage: [
        { id: 1, url: "12467.png" },
        { id: 2, url: "12467-1.png" },
      ],
    },
    {
      id: "12654",
      title:
        "ESCALERA METALICA  80 CM X 2 PELDAÑOS ARTICULADA NARANJA 150K  MAX 30*20 CM PASO",
      slug: "escalera-articulada-2",
      description:
        "ESCALERA METALICA  80 CM X 2 PELDAÑOS ARTICULADA NARANJA 150K  MAX 30*20 CM PASO",
      price: 97800,
      inStock: 5,
      tags: ["escalera-articulada-2"],
      reference: "12654",
      code: "FR-EP2023-2",
      master: 5,
      inner: 1,
      categoryId: "escaleras",
      ProductImage: [
        { id: 1, url: "12654.png" },
        { id: 2, url: "12654-1.png" },
      ],
    },
    {
      id: "12655",
      title:
        "ESCALERA METALICA 103 CM X 3 PELDAÑOS ARTICULADA NARANJA 150K MAX 30*20CM  PASO",
      slug: "escalera-articulada-3",
      description:
        "ESCALERA METALICA 103 CM X 3 PELDAÑOS ARTICULADA NARANJA 150K MAX 30*20CM  PASO",
      price: 5800,
      inStock: 5,
      tags: ["escalera-articulada-3"],
      reference: "12655",
      code: "FR-EP2023-3",
      master: 50,
      inner: 1,
      categoryId: "escaleras",
      ProductImage: [
        { id: 1, url: "12655.png" },
        { id: 2, url: "12655-1.png" },
      ],
    },
    {
      id: "13045",
      title: "GRABADOR DE METAL 110V  ",
      slug: "grabador-metal",
      description: "GRABADOR DE METAL 110V  ",
      price: 89000,
      inStock: 50,
      tags: ["grabador-metal"],
      reference: "13045",
      code: "TH-1",
      master: 50,
      inner: 1,
      categoryId: "herramienta_electrica",
      ProductImage: [
        { id: 1, url: "13045.png" },
        { id: 2, url: "13045-1.png" },
      ],
    },
    {
      id: "13235",
      title: "LLAVE LAVAMANOS PLASTICA CROMADA POMO CROMADO GR RESTREPO",
      slug: "grabador-metal",
      description: "LLAVE LAVAMANOS PLASTICA CROMADA POMO CROMADO GR RESTREPO",
      price: 14400,
      inStock: 50,
      tags: ["llave-lavamanos-cromada-gr"],
      reference: "13235",
      code: "FR-ZF321A",
      master: 100,
      inner: 1,
      categoryId: "herramienta_electrica",
      ProductImage: [
        { id: 1, url: "13235.png" },
        { id: 2, url: "13235-1.png" },
      ],
    },
    // más productos...
  ];

  // Simula paginación
  const pageSize = 10;
  const total = allProducts.length;
  const totalPages = Math.ceil(total / pageSize);
  const currentPage = page > totalPages ? totalPages : page;

  const paginated = allProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const products = paginated.map((product) => ({
    ...product,
    images: product.ProductImage.map((img) => img.url), // ✅ transformamos
  }));

  return {
    products,
    currentPage,
    totalPages,
  };
}

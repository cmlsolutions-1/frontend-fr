// src/utils/getClientProductPrice.ts
import { Product } from "@/interfaces/product.interface";
import { PriceCategory } from "@/services/priceCategories.service";

interface Client {
  _id: string;
  name: string;
  lastName: string;
  extra: {
    priceCategoryId: string; // referencia al _id de la categoría de precios
  };
}

export function getClientProductPrice(
  product: Product,
  client: Client,
  priceCategories: PriceCategory[],
  priceType: "valor" | "valorpos" = "valorpos"
): number | null {
  if (!product.precios || product.precios.length === 0) return null;

  // buscar la categoría del cliente
  const category = priceCategories.find(c => c._id === client.extra.priceCategoryId);
  if (!category) return null;

  // buscar el precio dentro del producto
  const precioCliente = product.precios.find(p => p.precio === category.code);
  if (!precioCliente) return null;

  return precioCliente[priceType] || null;
}

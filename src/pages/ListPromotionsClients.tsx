// src/pages/ListPromotionsClients.tsx
import React, { useEffect, useState } from "react";
import { usePromotionStore } from "@/store/usePromotionStore";
import { Promotion } from "@/interfaces/promotion.interface";
import { Badge } from "@/components/ui/Badge";
import { PromotionTableClient } from "@/components/promotion/PromotionTableClient";
import { getProducts } from "@/services/products.service";
import type { Product } from "@/interfaces/product.interface";

export default function ListPromotionsClients() {
  const { promotions, loadPromotions } = usePromotionStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Función para saber si una promoción ya expiró
  const isPromotionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  // ✅ Filtrar promociones activas y no expiradas
  const activePromotions = promotions.filter((promotion) => {
    const isExpired = isPromotionExpired(promotion.endDate);
    const isActive =
      promotion.state === "Active" || promotion.state === "Activo";
    return isActive && !isExpired;
  });

  // ✅ Cargar promociones y productos
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (promotions.length === 0) {
          await loadPromotions();
        }
        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (promotion: Promotion) => {
  if (isPromotionExpired(promotion.endDate)) {
    return <Badge variant="secondary">Expirada</Badge>;
  }
  return <Badge variant="default">Activa</Badge>; 
};


  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando promociones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Promociones Activas</h1>
          <p className="text-sm text-gray-500">
            Aquí puedes ver todas las promociones vigentes disponibles para tus compras online.
          </p>
        </div>
      </div>

      {/* Tabla de promociones o mensaje vacío */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        {activePromotions.length > 0 ? (
          <PromotionTableClient
            promotions={activePromotions}
            products={products}
            isPromotionExpired={isPromotionExpired}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <div className="p-10 text-center text-gray-500 border rounded-lg">
            <p className="text-lg">No hay promociones activas en este momento 😔</p>
          </div>
        )}
      </div>
    </div>
  );
}

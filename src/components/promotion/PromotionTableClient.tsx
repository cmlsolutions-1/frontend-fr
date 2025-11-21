// src/components/promotion/PromotionTableClient.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FaBoxOpen } from "react-icons/fa";
import {
  FaRegCalendarCheck as CalendarDays,
  FaEdit as Edit,
  FaPlus as Plus,
  FaTrashAlt as Trash2,
} from "react-icons/fa";
import type { Product } from "@/interfaces/product.interface";
import { Promotion } from "@/interfaces/promotion.interface";

interface PromotionTableClientProps {
  promotions: Promotion[];
  //products: Product[];
  onEdit?: (promotion: Promotion) => void;
  onDelete?: (id: string) => void;
  isPromotionExpired: (endDate: string) => boolean;
  getStatusBadge: (promotion: Promotion) => React.ReactNode;
}


const formatDate = (dateString?: string) => {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short", //
    year: "numeric",
  }).format(date);
};


export const PromotionTableClient: React.FC<PromotionTableClientProps> = ({
  promotions,
  //products,
  onEdit,
  onDelete,
  isPromotionExpired,
  getStatusBadge,
}) => {
  if (!promotions || promotions.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No hay promociones registradas
      </p>
    );
  }
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Promociones Activas</h2>
        <p className="text-sm text-gray-500">
          Conoce nuestra promociones vigentes
        </p>
      </div>

      <div className="p-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descuento
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Productos
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Cantidad Requerida
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Vigencia activa hasta
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            
            {promotions.map((promotion, index) => {
              
              return (

              <tr key={promotion._id ?? promotion.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{promotion.name}</div>
                  {promotion.description && (
                    <div className="text-sm text-gray-500">
                      {promotion.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline">
                    {promotion.percentage}% OFF
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                            {promotion.isAll ? (
                              <Badge variant="secondary" className="text-xs">Todos los productos</Badge>
                            ) : Array.isArray(promotion.products) && promotion.products.length > 0 ? (
                              <>
                                {promotion.products.length > 3 ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {promotion.products.length} productos
                                  </Badge>
                                ) : (
                          // --- CAMBIO: Acceder al ID del objeto producto ---
                          promotion.products.map((prodObj, idx) => (
                            <Badge
                              key={`${promotion._id ?? promotion.id}-product-${idx}`}
                              variant="secondary"
                              className="text-xs"
                            >
                              {prodObj.reference || prodObj._id || "ID desconocido"} {/* Accede al campo ID del objeto */}
                            </Badge>
                                    ))
                                  )}
                                </>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Sin productos
                                </Badge>
                              )}
                            </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
          <FaBoxOpen className="text-emerald-600" />
          {promotion.minimumQuantity} ({promotion.typePackage})
        </div>
      </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-1">
            <CalendarDays />
            {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
    </div>
  );
};

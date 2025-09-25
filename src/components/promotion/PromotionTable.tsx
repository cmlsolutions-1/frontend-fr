// src/components/promotion/PromotionTable.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  FaRegCalendarCheck as CalendarDays,
  FaEdit as Edit,
  FaPlus as Plus,
  FaTrashAlt as Trash2,
} from "react-icons/fa";
import type { Product } from "@/interfaces/product.interface";
import { Promotion } from "@/interfaces/promotion.interface";

interface PromotionTableProps  {
  promotions: Promotion[];
  products: Product[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
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


export const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions,
  products,
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
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold">Promociones Activas</h2>
        <p className="text-sm text-gray-500">
          Gestiona todas tus promociones desde aquí
        </p>
      </div>
      <div className="p-6">
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
                Vigencia
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            
            {promotions.map((promotion, index) => {
               console.log("Promotion individual:", promotion);
              console.log("Products de esta promo:", promotion.products);
              

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
                    promotion.products.map((prod: any, idx: number ) => {
                       console.log("Product en el map:", prod);
                       const product =
                            typeof prod === "string"
                              ? products.find((p) => p._id === prod)
                              : prod;

                       return (
                  <Badge
                    key={`${promotion._id ?? promotion.id}-product-${idx}`}
                    variant="secondary"
                    className="text-xs"
                  >
                    {product?.detalle ||
                                product?.referencia ||
                                product?._id ||
                                "Sin referencia"}
                  </Badge>
                );
              })
            ) : (
              <Badge variant="secondary" className="text-xs">
                Sin productos
              </Badge>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex items-center gap-1">
            <CalendarDays />
            {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {getStatusBadge(promotion)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => onEdit(promotion)}
            className="text-blue-600 hover:text-blue-900 mr-4"
          >
            <Edit />
          </button>
          <button
            onClick={() => onDelete(promotion._id ?? promotion.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 />
          </button>
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

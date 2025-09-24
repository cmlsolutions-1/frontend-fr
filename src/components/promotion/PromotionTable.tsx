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

interface Props {
  promotions: Promotion[];
  products: Product[];
  onEdit: (promotion: Promotion) => void;
  onDelete: (id: string) => void;
  isPromotionExpired: (endDate: string) => boolean;
  getStatusBadge: (promotion: Promotion) => React.ReactNode;
}

export const PromotionTable = ({
  promotions,
  onEdit,
  onDelete,
  isPromotionExpired,
  getStatusBadge,
}: Props) => {
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
            {promotions.map((promotion) => (
              <tr key={promotion.id}>
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
                    promotion.products.map((product) => (
                      <Badge key={product._id} variant="secondary" className="text-xs">
                        {product.reference || product.description || product._id}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="secondary" className="text-xs">Sin productos</Badge>
                  )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarDays /> {/* Icono correcto */}
                    {promotion.startDate} - {promotion.endDate}
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
                    onClick={() => onDelete(promotion.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

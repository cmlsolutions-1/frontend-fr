// src/mocks/mock-promotions.ts
import type { Promotion } from '@/interfaces/promotion.interface';

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Descuento Verano',
    description: 'Promoción especial de verano para productos seleccionados',
    discountPercentage: 25,
    typePackage: 'unidad',
    minimunQuantity: 5,
    productTypes: ['ropa', 'deportes'],
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
    createdAt: '2024-05-15',
  },
  {
    id: '2',
    name: 'Black Friday',
    description: 'Mega descuentos en electrónicos',
    discountPercentage: 40,
    typePackage: 'master',
    minimunQuantity: 1,
    productTypes: ['electronica'],
    startDate: '2024-11-29',
    endDate: '2024-11-29',
    isActive: false,
    createdAt: '2024-05-20',
  },
];
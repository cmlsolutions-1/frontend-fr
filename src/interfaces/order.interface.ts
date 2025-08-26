// src/interfaces/order.interface.ts
export interface Order {
  id: string;
  isPaid: boolean;
  subTotal: number;
  tax: number;
  total: number;
  paymentDate: Date | null;
  createdAt: Date;
  clientId: string;
  salesPersonId: string;

  OrderAddress: {
    firstName: string;
    lastName: string;
    address: string;
    postalCode: string;
    city: string;
    countryId: string;
    phone: string;
  };
  OrderItem: Array<{
    productId: string;
    quantity: number;
    price: number;
    product: {
      slug: string;
      title: string;
      ProductImage: Array<{ url: string }>;
    };
  }>;
  itemsInOrder?: number;
}
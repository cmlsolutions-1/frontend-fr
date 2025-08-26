// src/models/order.model.ts
import { Order } from "../interfaces/order.interface";

export class OrderModel implements Order {
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

  constructor(order: Order) {
    this.id = order.id;
    this.isPaid = order.isPaid;
    this.subTotal = order.subTotal;
    this.tax = order.tax;
    this.total = order.total;
    this.paymentDate = order.paymentDate;
    this.createdAt = order.createdAt;
    this.clientId = order.clientId;
    this.salesPersonId = order.salesPersonId;
    this.OrderAddress = order.OrderAddress;
    this.OrderItem = order.OrderItem;
    this.itemsInOrder = order.itemsInOrder ?? this.calculateItemsInOrder();
  }

  // ✅ Devuelve el nombre completo del cliente
  get clientFullName(): string {
    return `${this.OrderAddress.firstName} ${this.OrderAddress.lastName}`;
  }

  // ✅ Calcula cuántos ítems hay en la orden
  calculateItemsInOrder(): number {
    return this.OrderItem.reduce((acc, item) => acc + item.quantity, 0);
  }

  // ✅ Devuelve una fecha formateada de creación
  get formattedDate(): string {
    return this.createdAt.toLocaleDateString();
  }

  // ✅ Devuelve si la orden está pendiente o pagada
  get paymentStatus(): string {
    return this.isPaid ? "Pagada" : "Pendiente";
  }
}

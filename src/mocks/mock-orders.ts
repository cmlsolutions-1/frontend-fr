// src/mocks/mock-orders.ts
import type { Order } from "@/interfaces/order.interface";

export let mockOrders: Order[] = [
  {
    id: "order-abc123",
    isPaid: true,
    subTotal: 100000,
    tax: 15000,
    total: 115000,
    paymentDate: new Date(),
    createdAt: new Date(),
    clientId: "client-123",
    salesPersonId: "salesperson-456",
    OrderAddress: {
      firstName: "Carlos",
      lastName: "Pérez",
      address: "Calle 123 #45 - Armenia",
      postalCode: "670000",
      city: "Armenia",
      countryId: "CO",
      phone: "3101234567",
    },
    OrderItem: [
      {
        productId: "13045",
        quantity: 1,
        price: 50000,
        product: {
          slug: "taladro-electrico",
          title: "Taladro Eléctrico",
          ProductImage: [{ url: "13045.png" }],
        },
      },
      {
        productId: "12654",
        quantity: 1,
        price: 50000,
        product: {
          slug: "escalera-aluminio",
          title: "Escalera de Aluminio",
          ProductImage: [{ url: "12654.png" }],
        },
      },
    ],
    itemsInOrder: 2, // ✅ Ahora sí puedes usar esto
  },
];

export const addOrderToMock = (newOrder: Order) => {
  mockOrders.push(newOrder);
};

export const updateOrderStatusToPaid = (id: string) => {
  // Busca la orden y actualiza su estado
  const updatedOrders = mockOrders.map((order) =>
    order.id === id ? { ...order, isPaid: true } : order
  );

  mockOrders = updatedOrders;

  return updatedOrders.find((order) => order.id === id);
};

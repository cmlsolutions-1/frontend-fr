// src/mocks/placeOrder.ts
import { v4 as uuidv4 } from "uuid";
import { sleep } from "@/utils/sleep";
import { addOrderToMock } from '@/mocks/mock-orders';
import { Order } from "@/interfaces/order.interface";



 export const placeOrder = async (productsToOrder: any[], address: any) => {
   await new Promise((resolve) => setTimeout(resolve, 800)); 
// export const placeOrder = async (productsToOrder: any[], address: any) => {
//   await sleep(800);// Simula tiempo de procesamiento

  if (!address || productsToOrder.length === 0) {
    return {
      ok: false,
      message: "Faltan datos para crear la orden.",
    };
  }

  // Genera un ID único para la orden
  const orderId = uuidv4();
  

  const orderItems = productsToOrder.map((item) => ({
    productId: item.productId || item.id,
    quantity: item.quantity,
    price: item.price,
    product: {
      slug: item.slug,
      title: item.title,
      ProductImage: [{ url: item.image }],
    },
  }));

  
  const order: Order = {
    id: orderId,
    isPaid: false,
    subTotal: 0,
    tax: 0,
    total: 0,
    paymentDate: null,
    createdAt: new Date(),
    clientId: 'client-123',
    salesPersonId: 'salesperson-456',
    OrderAddress:address,
    OrderItem: productsToOrder.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      product: {
        id: item.id,
        slug: item.slug,
        title: item.title,
        ProductImage: [{ url: item.image }],
      },
    })),
    itemsInOrder: productsToOrder.length,
  };


  // Calcula totales
  let subTotal = productsToOrder.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subTotal * 0.15;
  const total = subTotal + tax;

  order.subTotal = subTotal;
  order.tax = tax;
  order.total = total;

  try {
    // ✅ Agrega logs para ver si llega aquí

    addOrderToMock(order);

  } catch (error) {

    return {
      ok: false,
      message: 'No se pudo guardar la orden',
    };
  }

  return {
    ok: true,
    order,
  };
};

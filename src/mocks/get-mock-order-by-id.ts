// src/mocks/order/get-mock-order-by-id.ts

export const getMockOrderById = async (id: string) => {
  const mockOrder = {
    id,
    isPaid: false,
    subTotal: 100000,
    tax: 15000,
    total: 115000,
    itemsInOrder: 2,
    OrderAddress: {
      firstName: "Carlos",
      lastName: "Martínez",
      address: "Calle 123",
      address2: "Apto 4",
      postalCode: "12345",
      city: "Armenia",
      countryId: "CO",
      phone: "3001234567",
    },
    OrderItem: [
      {
        quantity: 1,
        price: 50000,
        product: {
          slug: "taladro-electrico",
          title: "Taladro Eléctrico",
          ProductImage: [
            { url: "13045.png" }
          ]
        }
      },
      {
        quantity: 1,
        price: 50000,
        product: {
          slug: "escalera-aluminio",
          title: "Escalera de Aluminio",
          ProductImage: [
            { url: "12654.png" }
          ]
        }
      }
    ]
  }

  return {
    ok: true,
    order: mockOrder
  }
}

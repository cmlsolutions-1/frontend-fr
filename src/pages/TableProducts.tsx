//src/pages/TableProducts.tsx

import { ProductsTable } from "@/components/productsTable/products-table";

export default function TableProducts() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 mt-[100px] ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-2">Activa los productos mas recientes</p>
        </div>
        <ProductsTable />
      </div>
    </main>
  );
}
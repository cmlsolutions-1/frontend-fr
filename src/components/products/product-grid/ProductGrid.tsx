//src/components/products/product-grid/ProductGrid.tsx

import { Product } from "@/interfaces";
import { ProductGridItem } from "./ProductGridItem";

interface Props {
  products: Product[];
}

export const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6 md:gap-8 mb-10 px-4 sm:px-0">
      {products.map((product) => (
        <ProductGridItem key={product._id} product={product} />
      ))}
    </div>
  );
};

// src/pages/CategoryByPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { mockCategories } from "@/mocks/mock-categories";
import { mockProducts } from "@/mocks/mock-products";
import { ProductGrid, Title } from "@/components";

export const CategoryByPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const selectedCategory = mockCategories.find((cat) => cat.id === category);

  if (!selectedCategory) {
    navigate("/"); // Redirige si no existe la categoría
    return null;
  }

  const products = mockProducts
    .filter((product) => product.categoryId === category)
    .map((product) => ({
      ...product,
      images: product.ProductImage.map((img) => img.url),
    }));

  if (products.length === 0) {
    navigate(`/category/${category}`);
    return null;
  }

  return (
    <>
      <Title
        title={`Artículos de ${selectedCategory.name}`}
        subtitle="Todos los productos"
        className="mb-2"
      />
      <ProductGrid products={products} />
    </>
  );
};

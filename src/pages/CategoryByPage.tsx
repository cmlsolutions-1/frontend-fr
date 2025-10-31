// src/pages/CategoryByPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCategories } from "@/mocks/mock-categories";
import { mockProducts } from "@/mocks/mock-products";
import { ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useCartStore } from "@/store/useCartStore";

export const CategoryByPage = () => {

//esto es usado con datos quemados sin BACKEND

  // const { category } = useParams();
  // const navigate = useNavigate();

  // const selectedCategory = mockCategories.find((cat) => cat.id === category);

  // if (!selectedCategory) {
  //   navigate("/"); // Redirige si no existe la categoría
  //   return null;
  // }

  // const products = mockProducts
  //   .filter((product) => product.categoryId === category)
  //   .map((product) => ({
  //     ...product,
  //     images: product.ProductImage.map((img) => img.url),
  //   }));

  // if (products.length === 0) {
  //   navigate(`/category/${category}`);
  //   return null;
  // }

//ESTO ES DESDE EL BACKEND
const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const { categories } = useCategoryStore();
  const selectedCategory = categories.find((cat) => cat.name === category);

  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!selectedCategory) {
      navigate("/");
      return;
    }

    // Aquí puedes llamar al backend con /api/categories/:id/products
    const loadProducts = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/categories/${category}/products`);
        if (!res.ok) {
          throw new Error("No se pudieron cargar los productos");
        }
        const data = await res.json();
        setProducts(data.items || []);
      } catch (e) {

        const mockProducts = useCartStore.getState().cart;
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  if (loading) return <p>Cargando productos de esta categoría...</p>;

//TERMINA BACKEND



  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Title
        title={`Artículos de ${selectedCategory.name}`}
        subtitle="Todos los productos"
        className="mb-2"
      />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Columna izquierda - Filtros */}
              <div className="md:col-span-1">
                <CategoryFilterSidebar />
        </div>
      <div className="md:col-span-3">
        <ProductGrid products={products} />
      </div>
      </div>
    </div>
  );
};

// src/pages/product/ProductPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClientProductPrice } from "@/utils/getClientProductPrice";
import { getPriceCategories, PriceCategory } from '@/services/priceCategories.service';
import { useAuthStore } from '@/store/auth-store';

import { titleFont } from '@/config/fonts';
import {
  ProductMobileSlideshow,
  ProductSlideshow,
  StockLabel
} from '@/components';
import { getMockProductBySlug } from '@/mocks/getMockProductBySlug';
import { AddToCart } from './ui/AddToCart';
import { Product } from '@/interfaces';
import { User } from 'lucide-react';
import { getProductById } from '@/services/products.service';

export const ProductPage = () => {
  const { _id  } = useParams<{ _id : string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();


  const [product, setProduct] = useState<Product | null>(null);
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const placeholder = "/img/placeholder.jpg"; // imagen por defecto

  useEffect(() => {
    const fetchProduct = async () => {
      if (!_id) return;

      try {
      const fetchedProduct = await getProductById(_id);
      setProduct(fetchedProduct);
    } catch (error) {
      console.error("Error al cargar producto:", error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [_id, navigate]);

  if (loading) return <p className="p-4">Cargando...</p>;
  if (!product) return <p className="p-4">Producto no encontrado</p>;

  const clientPrice = User && priceCategories.length > 0
    ? getClientProductPrice(product, user, priceCategories, "valorpos")
    : null;

  // Precio según tipo de cliente (ejemplo: usamos "valor")
  const priceType: "valor" | "valorpos" = "valor";
  const getClientPrice = () => {
    if (!product.precios || product.precios.length === 0) return "Sin precio";
    const precio = product.precios[0][priceType];
    return precio && precio > 0 ? `$${precio}` : "Sin precio";
  };
  // Package Master
  const masterPackage = product.packages?.find((p) => p.typePackage === "Master");

  return (
    <div className="mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Slideshow */}
      <div className="col-span-1 md:col-span-2">
        <ProductMobileSlideshow
          title={product.detalle}
          images={[product.image ? `/products/${product.image}` : placeholder]}
          className="block md:hidden"
        />
        <ProductSlideshow
          title={product.detalle}
          images={[product.image ? `/products/${product.image}` : placeholder]}
          className="hidden md:block"
        />
      </div>

      {/* Detalles */}
      <div className="col-span-1 px-5">
        <StockLabel slug={product._id} />

        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.detalle}
        </h1>

        {/* Precio */}
        <p className="text-lg mb-5">{getClientPrice()}</p>

        <AddToCart product={product} />
        {/* Master package */}
        <div className="mt-4">
          <h3 className="font-bold text-sm">Master</h3>
          <p className="font-light">
            {masterPackage ? masterPackage.mount : "N/A"} unidades
          </p>
        </div>
{/* Descripción */}
        <h3 className="font-bold text-sm mt-4">Descripción</h3>
        <p className="font-light">{product.detalle}</p>
      </div>
    </div>
  );
};

// src/pages/product/ProductPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { titleFont } from '@/config/fonts';
import {
  ProductMobileSlideshow,
  ProductSlideshow,
  StockLabel
} from '@/components';
import { getMockProductBySlug } from '@/mocks/getMockProductBySlug';
import { AddToCart } from './ui/AddToCart';
import { Product } from '@/interfaces';

export const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      const fetchedProduct = await getMockProductBySlug(slug);

      if (!fetchedProduct) {
        navigate('/404');
        return;
      }

      setProduct(fetchedProduct);
    };

    fetchProduct();
  }, [slug, navigate]);

  if (!product) return <p className="p-4">Cargando...</p>;

  return (
    <div className="mt-5 mb-20 grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Slideshow */}
      <div className="col-span-1 md:col-span-2">
        <ProductMobileSlideshow
          title={product.title}
          images={product.images}
          className="block md:hidden"
        />
        <ProductSlideshow
          title={product.title}
          images={product.images}
          className="hidden md:block"
        />
      </div>

      {/* Detalles */}
      <div className="col-span-1 px-5">
        <StockLabel slug={product.slug} />

        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>

        <p className="text-lg mb-5">${product.price}</p>

        <AddToCart product={product} />

        <h3 className="font-bold text-sm mt-4">Descripción</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </div>
  );
};

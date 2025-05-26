import { useEffect, useState } from 'react';
import { getPaginatedMockProductsWithImages } from '@/mocks/getPaginatedMockProducts';
import { Pagination, ProductGrid, Title } from '@/components';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getPaginatedMockProductsWithImages({ page: currentPage });
      setProducts(response.products);
      setTotalPages(response.totalPages);
    };

    fetchProducts();
  }, [currentPage]);

  return (
    <>
      <Title title="Distribucciones Ferrelectricos Restrepo" subtitle="Todos los productos" className="mb-2" />
      <ProductGrid products={products} />
      <Pagination totalPages={totalPages} />
    </>
  );
};

export default HomePage;

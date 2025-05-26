// src/pages/ContenedorPage.tsx
import { useParams, Navigate } from 'react-router-dom';
import { Title, ProductGrid } from '../components';
// import { getProductsByContenedorId } from '../actions/contenedor/get-products-by-contenedor-id';
import { getProductsByContenedorId } from '../mocks/get-products-by-contenedor-id';
import { useEffect, useState } from 'react';

export default function ContenedorPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const contenedorId = Number(id);
    if (isNaN(contenedorId)) {
      setNotFound(true);
      return;
    }

    getProductsByContenedorId(contenedorId).then((res) => {
      if (!res || res.products.length === 0) {
        setNotFound(true);
      } else {
        setData(res);
      }
    });
  }, [id]);

  if (notFound) return <Navigate to="/404" replace />;

  if (!data) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <Title
        title={`Productos del Contenedor ${data.nombre}`}
        subtitle="Listado de productos"
        className="mb-6"
      />
      <ProductGrid products={data.products} />
    </div>
  );
}

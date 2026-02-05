import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { listFavoriteProducts } from "@/services/products.service";
import { ProductGrid, Pagination, Title } from "@/components";


const NewsProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  // ✅ declarar ANTES de usar
  const [hasNextPage, setHasNextPage] = useState(false);

  const totalPages = hasNextPage ? page + 1 : page;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");

    params.set("limit", String(limit));
    navigate(`?${params.toString()}`, { replace: true });

    setTimeout(() => {
      const scrollableElement = document.getElementById("main-content");
      if (scrollableElement) scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    let mounted = true;

    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await listFavoriteProducts({ page, limit });
        if (!mounted) return;

        setProducts(data);
        setHasNextPage(data.length === limit);
      } catch (err: any) {
        if (!mounted) return;

        if (err?.isAuthError) {
          logout();
          setError("auth_expired");
        } else {
          setError(err?.message || "Error al cargar favoritos.");
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFavorites();
    return () => {
      mounted = false;
    };
  }, [page, limit, logout]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (error === "auth_expired") {
    return (
      <div className="container mx-auto p-6 mt-[90px]">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <p className="text-yellow-700">
            Tu sesión ha expirado.{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              vuelve a iniciar sesión
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 mt-[90px]">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 mt-[80px]">
      <Title title="Productos Nuevos" 
        subtitle="Conoce Lo Nuevo En Nuestro Catálogo" />

      {products.length === 0 ? (
        <p className="text-center text-gray-600">No tienes productos favoritos aún.</p>
      ) : (
        <>
          {/*  aquí viene el override de 4 columnas */}
          <div className="product-grid-override">
            <ProductGrid products={products} />
          </div>

          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
};

export default NewsProducts;
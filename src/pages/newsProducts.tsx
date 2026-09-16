// src/pages/newsProducts.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { listFavoriteProducts } from "@/services/products.service";
import { Pagination } from "@/components";
import type { Product } from "@/interfaces";
import { Agregar } from "@/components/products/product-grid/Agregar";
import { Home, PackageCheck } from "lucide-react";



const NewsProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const page = parseInt(searchParams.get("page") || "1");
  const PRODUCTS_PER_PAGE = 12;
  const isClient = user?.role === "Client";

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);

    if (newPage > 1) params.set("page", String(newPage));
    else params.delete("page");

    params.set("limit", String(PRODUCTS_PER_PAGE));
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
        const data = await listFavoriteProducts({ page, limit: PRODUCTS_PER_PAGE });
        if (!mounted) return;

        setProducts(data.products);
        setTotalPages(data.totalPages);
        setTotalProducts(data.total);
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
  }, [page, logout]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando productos nuevos...</p>
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
    <main className="min-h-screen  text-[#171714]">
      <div className="mx-auto max-w-[1440px] px-6 pb-16 pt-[110px] md:px-10 lg:px-16">
        <header className="mb-12 flex justify-end">
          <button
            onClick={() => navigate("/homePage")}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#F4C048] transition"
          >
            <Home className="w-4 h-4" />
            Inicio
          </button>
        </header>

        <section className="grid gap-10 pb-16 md:pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="flex flex-col justify-end lg:pb-6">
            <h1 className="max-w-[760px] text-[clamp(3.4rem,8vw,8rem)] font-medium leading-[0.88] tracking-[-0.08em]">
              Productos
              <br />
              <span className="text-[#F2B318]">recién</span> llegados.
            </h1>
            <div className="mt-9 flex max-w-[520px] items-end justify-between gap-8">
              <p className="text-[15px] leading-6 text-[#696862]">
                Una vitrina limpia para descubrir referencias nuevas, revisar disponibilidad y entrar directo al producto.
              </p>
              <a
                href="#new-products"
                className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] underline underline-offset-8 md:block"
              >
                Explorar ↓
              </a>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden border border-[#eeeeee] bg-white shadow-sm md:min-h-[500px]">
            {products[0] ? (
              <img
                src={getProductImage(products[0])}
                alt={products[0].detalle}
                className="absolute inset-0 h-full w-full object-contain p-10"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[#696862]">
                Nuevos productos
              </div>
            )}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-[#171714] md:bottom-8 md:left-8 md:right-8">
              <span>Catálogo destacado</span>
              <span>{String(products.length).padStart(2, "0")} / {String(totalProducts || products.length).padStart(2, "0")}</span>
            </div>
          </div>
        </section>
      </div>

      {products.length === 0 ? (
        <div className="mx-auto max-w-[1440px] px-6 pb-20 md:px-10 lg:px-16">
        <div className="rounded-none border border-[#d8d6cf] bg-white/60 p-10 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-3 text-gray-600">No hay productos nuevos disponibles por ahora.</p>
        </div>
        </div>
      ) : (
        <section id="new-products" className="mx-auto max-w-[1440px] px-6 pb-24 md:px-10 lg:px-16 lg:pb-32">
          <div className="mb-8 flex items-end justify-between border-t border-[#d8d6cf] pt-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F2B318]">
                Recién llegados
              </p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.06em] md:text-4xl">
                Novedades, listas para pedir.
              </h2>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <NewProductCard key={product._id} product={product} isClient={isClient} />
            ))}
          </div>

          <Pagination totalPages={totalPages} currentPage={page} onPageChange={handlePageChange} />
        </section>
      )}
    </main>
  );
};

const NewProductCard = ({ product, isClient }: { product: Product; isClient: boolean }) => {
  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);

  return (
    <article className="group">
      <div className="relative aspect-[0.84] overflow-hidden border border-[#eeeeee] bg-white shadow-[0_16px_36px_rgba(23,23,20,0.06)]">
        <Link to={`/product/${product._id}`} className="absolute inset-0 flex items-center justify-center p-7">
          <img
            src={imageUrl}
            alt={product.detalle}
            className="max-h-full max-w-full object-contain transition duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        <Link
          to={`/product/${product._id}`}
          className="absolute bottom-4 left-4 right-4 translate-y-16 bg-[#171714] py-3 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          Ver detalle
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 pt-4">
        <div className="min-w-0">
          <Link to={`/product/${product._id}`} className="line-clamp-2 text-[15px] font-medium leading-5 tracking-[-0.02em] text-[#171714] hover:text-[#9a6b00]">
            {cleanTitle(product.detalle)}
          </Link>
          <p className="mt-1 text-[12px] text-[#7c7a73]">
            Ref. {product.referencia || "N/A"} · Stock {product.stock ?? 0}
          </p>
          <p className="mt-1 text-[12px] text-[#7c7a73]">
            Master {getMasterValue(product)}
          </p>
        </div>

        {isClient && (
          <p className="shrink-0 text-[13px] font-semibold text-[#171714]">
            {price > 0 ? `$${price.toLocaleString("es-CO")}` : "Sin precio"}
          </p>
        )}
      </div>

      {isClient && (
        <div className="mt-4">
            {product.stock <= 0 ? (
              <span className="inline-flex w-full items-center justify-center bg-red-500 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Agotado
              </span>
            ) : (
              <Agregar product={product} />
            )}
        </div>
      )}
    </article>
  );
};

const getProductImage = (product: Product) => product.image?.url?.trim() || "/images/no-image.jpg";

const getMasterValue = (product: Product) => {
  const masterPackage = product.packages?.find((p) => p.typePackage === "Master");
  return masterPackage ? masterPackage.Mount : "N/A";
};

const getProductPrice = (product: Product) => {
  if (!product.precios?.length) return 0;
  return product.precios[0]?.valorpos || product.precios[0]?.valor || 0;
};

const cleanTitle = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\n\r\u2028\u2029\u200B]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default NewsProducts;

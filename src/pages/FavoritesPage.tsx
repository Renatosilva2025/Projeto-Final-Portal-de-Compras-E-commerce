import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, HeartOff } from "lucide-react";
import { useNavigate } from "react-router";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { EmptyState } from "@/components/store/EmptyState";
import { ErrorState } from "@/components/store/ErrorState";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/store/ProductCardSkeleton";
import { useFavorites } from "@/context/favorites-context";
import { fetchProducts } from "@/services/api";
import type { Product } from "@/types/product";

/** Página de favoritos — produtos salvos no navegador. */
export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao carregar os produtos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const favorites = useMemo(
    () => products.filter((p) => favoriteIds.includes(p.id)),
    [products, favoriteIds],
  );

  return (
    <StoreLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="flex items-center gap-2.5 font-serif text-3xl font-bold sm:text-4xl">
          Meus favoritos
          <Heart className="size-7 fill-red-500 text-red-500" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {favorites.length === 0
            ? "Os produtos que você curtir aparecem aqui."
            : `${favorites.length} ${
                favorites.length === 1 ? "produto salvo" : "produtos salvos"
              } no seu navegador.`}
        </p>

        <div className="mt-8">
          {error ? (
            <ErrorState message={error} onRetry={load} />
          ) : loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={HeartOff}
              title="Nenhum favorito ainda"
              description="Toque no coração de um produto para salvá-lo aqui."
              actionLabel="Explorar produtos"
              onAction={() => navigate("/")}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}

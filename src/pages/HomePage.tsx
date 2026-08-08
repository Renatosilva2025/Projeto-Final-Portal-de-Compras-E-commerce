import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Heart, PackageSearch, SearchX } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import { EmptyState } from "@/components/store/EmptyState";
import { ErrorState } from "@/components/store/ErrorState";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/store/ProductCardSkeleton";
import { ProductImage } from "@/components/store/ProductImage";
import { SortSelect, SORT_OPTIONS, type SortOption } from "@/components/store/SortSelect";
import { fetchCategories, fetchProducts } from "@/services/api";
import { formatPrice } from "@/lib/format";
import { categoryLabel, type Product } from "@/types/product";

const HERO_STATS = [
  { value: "20+", label: "Produtos na vitrine" },
  { value: "4", label: "Categorias" },
  { value: "US$", label: "Preços reais da API" },
];

/** Página inicial: hero + catálogo completo com filtros, busca e ordenação. */
export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("categoria");
  const q = searchParams.get("q") ?? "";
  const rawSort = searchParams.get("ordem") ?? "relevance";
  const sort: SortOption = SORT_OPTIONS.some((o) => o.value === rawSort)
    ? (rawSort as SortOption)
    : "relevance";

  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
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

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = [...products];

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          categoryLabel(p.category).toLowerCase().includes(term),
      );
    }

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        list.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }
    return list;
  }, [products, category, q, sort]);

  const hasFilters = Boolean(category || q || sort !== "relevance");
  const heroProducts = products?.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-0 size-80 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
            <div className="space-y-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <PackageSearch className="size-4" />
                Projeto Final — Portal de Compras
              </span>

              <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                O catálogo que você procura,{" "}
                <span className="italic text-primary">em um só lugar.</span>
              </h1>

              <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                Explore produtos de eletrônicos, joias e moda em uma vitrine
                única e elegante — alimentada pela Fake Store API.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full">
                  <a href="#catalogo">
                    Explorar catálogo
                    <ArrowDown className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                >
                  <Link to="/favoritos">
                    <Heart className="size-4" />
                    Ver favoritos
                  </Link>
                </Button>
              </div>

              <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-serif text-2xl font-bold text-primary">
                      {stat.value}
                    </dd>
                    <dd className="text-xs text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Colagem de produtos */}
            <div className="relative hidden h-[400px] w-full lg:block">
              <div className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/30" />

              {heroProducts
                ? heroProducts.map((product, i) => {
                    const position = [
                      "left-6 top-20 -rotate-6",
                      "left-1/2 top-4 z-10 -translate-x-1/2 rotate-2",
                      "right-6 top-28 rotate-6",
                    ][i];
                    return (
                      <motion.div
                        key={product.id}
                        className={`absolute w-36 ${position}`}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.15 + i * 0.12,
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                      >
                        <Link
                          to={`/produto/${product.id}`}
                          className="block rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 transition-transform duration-300 hover:scale-105"
                        >
                          <ProductImage
                            src={product.image}
                            alt={product.title}
                            className="aspect-square w-full rounded-xl"
                          />
                          <p className="mt-2 line-clamp-1 text-[11px] font-medium text-neutral-700">
                            {product.title}
                          </p>
                          <p className="text-sm font-bold text-neutral-900">
                            {formatPrice(product.price)}
                          </p>
                        </Link>
                      </motion.div>
                    );
                  })
                : loading &&
                  [0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`absolute w-36 ${
                        [
                          "left-6 top-20 -rotate-6",
                          "left-1/2 top-4 z-10 -translate-x-1/2 rotate-2",
                          "right-6 top-28 rotate-6",
                        ][i]
                      }`}
                    >
                      <Skeleton className="aspect-square w-full rounded-2xl bg-white/60" />
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ── Catálogo ──────────────────────────────────────────── */}
        <section
          id="catalogo"
          className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Catálogo
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category
                    ? `Mostrando produtos de ${categoryLabel(category)}`
                    : "Todos os produtos disponíveis na API"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!loading && !error && (
                  <span className="whitespace-nowrap text-sm text-muted-foreground">
                    {filtered.length}{" "}
                    {filtered.length === 1 ? "produto" : "produtos"}
                  </span>
                )}
                <SortSelect
                  value={sort}
                  onChange={(value) => setParam("ordem", value)}
                />
              </div>
            </div>

            <CategoryFilter
              categories={categories}
              active={category}
              onSelect={(value) => setParam("categoria", value)}
            />

            {error ? (
              <ErrorState message={error} onRetry={load} />
            ) : loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={q ? "Nenhum produto encontrado" : "Nada por aqui"}
                description={
                  q
                    ? `Não encontramos resultados para "${q}". Tente outro termo.`
                    : "Não há produtos nesta categoria. Tente limpar os filtros."
                }
                actionLabel={hasFilters ? "Limpar filtros" : "Ver todos"}
                onAction={hasFilters ? clearFilters : () => setParam("categoria", null)}
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

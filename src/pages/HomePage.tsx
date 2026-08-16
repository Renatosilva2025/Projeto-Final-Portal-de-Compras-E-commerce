import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import {
  ArrowDown,
  Heart,
  PackageSearch,
  SearchX,
  Store,
  Tag,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/store/CartDrawer";
import { useFavorites } from "@/context/favorites-context";
import { CategoryCarousel } from "@/components/store/CategoryCarousel";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import { EmptyState } from "@/components/store/EmptyState";
import { FlashSale } from "@/components/store/FlashSale";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCardSkeleton } from "@/components/store/ProductCardSkeleton";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { ProductImage } from "@/components/store/ProductImage";
import {
  SortSelect,
  SORT_OPTIONS,
  type SortOption,
} from "@/components/store/SortSelect";
import { formatPrice } from "@/lib/format";
import { discountPercent, flashProducts } from "@/lib/flash-sale";
import { CATEGORY_ICONS } from "@/components/store/category-icons";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";

/** Separa o título do hero: a parte após a última vírgula ganha itálico. */
function splitHeroTitle(title: string): [string, string | null] {
  const idx = title.lastIndexOf(",");
  if (idx === -1) return [title, null];
  return [title.slice(0, idx), title.slice(idx + 1).trim()];
}

/** Campo de faixa de preço com prefixo R$ e cantos arredondados. */
function PriceField({
  value,
  placeholder,
  onValue,
}: {
  value: string;
  placeholder: string;
  onValue: (value: string | null) => void;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
        R$
      </span>
      <Input
        value={value}
        onChange={(e) => onValue(e.target.value === "" ? null : e.target.value)}
        placeholder={placeholder}
        inputMode="decimal"
        aria-label={`Preço ${placeholder.toLowerCase()}`}
        className="h-9 w-24 rounded-full pl-8 text-sm"
      />
    </div>
  );
}

/** Página inicial: hero + catálogo completo com filtros, busca e ordenação. */
export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("categoria");
  const q = searchParams.get("q") ?? "";
  const rawSort = searchParams.get("ordem") ?? "relevance";
  const rawMin = searchParams.get("min");
  const rawMax = searchParams.get("max");
  const minPrice = rawMin ? Number(rawMin) : undefined;
  const maxPrice = rawMax ? Number(rawMax) : undefined;
  const onlyFavorites = searchParams.get("favoritos") === "1";
  const sort: SortOption = SORT_OPTIONS.some((o) => o.value === rawSort)
    ? (rawSort as SortOption)
    : "relevance";

  const products = useQuery(api.products.list, category ? { category } : {});
  const allProducts = useQuery(api.products.list, {});
  const categories = useQuery(api.products.categories);
  const community = useQuery(api.products.listCommunity);
  const hero = useQuery(api.settings.getHero);
  const { favoriteIds } = useFavorites();

  const loading = products === undefined || categories === undefined;

  // Conteúdo institucional (editável pelo administrador no painel).
  const heroBadge = hero?.heroBadge ?? "Portal de Compras PD · Projeto final";
  const heroTitle =
    hero?.heroTitle ?? "Eletrônicos e acessórios, em um só lugar.";
  const heroDescription =
    hero?.heroDescription ??
    "Capas de celular, carregadores, notebooks, fones e muito mais — compre como em um marketplace, anuncie seus produtos e avalie o que comprou.";
  const [heroMain, heroAccent] = splitHeroTitle(heroTitle);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const filtered = useMemo(() => {
    const list = products ?? [];
    let result = [...list];
    const term = q.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          categoryLabel(p.category).toLowerCase().includes(term),
      );
    }
    if (typeof minPrice === "number" && Number.isFinite(minPrice)) {
      result = result.filter((p) => p.price >= minPrice);
    }
    if (typeof maxPrice === "number" && Number.isFinite(maxPrice)) {
      result = result.filter((p) => p.price <= maxPrice);
    }
    if (onlyFavorites) {
      result = result.filter((p) => favoriteIds.includes(p._id));
    }
    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title, "pt-BR"));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "discount-desc":
        result.sort((a, b) => discountPercent(b) - discountPercent(a));
        break;
      case "rating-desc":
        result.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
    }
    return result;
  }, [products, q, sort, minPrice, maxPrice, onlyFavorites, favoriteIds]);

  const hasPriceFilter =
    (typeof minPrice === "number" && Number.isFinite(minPrice)) ||
    (typeof maxPrice === "number" && Number.isFinite(maxPrice));
  const hasFilters = Boolean(
    category || q || sort !== "relevance" || onlyFavorites || hasPriceFilter,
  );
  const heroProducts = (allProducts ?? []).slice(0, 3);

  /** Agrupa todos os produtos por categoria para os carrosséis. */
  const byCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const product of allProducts ?? []) {
      const list = map.get(product.category);
      if (list) list.push(product);
      else map.set(product.category, [product]);
    }
    return map;
  }, [allProducts]);

  /** Modo vitrine: sem busca, categoria, ordenação, preço ou favoritos → carrosséis. */
  const browseMode =
    !category && !q && sort === "relevance" && !onlyFavorites && !hasPriceFilter;

  /** Produtos em oferta para a vitrine relâmpago (maior desconto primeiro). */
  const flash = useMemo(() => flashProducts(allProducts ?? []), [allProducts]);

  /** Slug sem acentos usado nas âncoras dos carrosséis. */
  const categorySlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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
                {heroBadge}
              </span>

              <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                {heroMain}
                {heroAccent && (
                  <>
                    ,{" "}
                    <span className="italic text-primary">{heroAccent}</span>
                  </>
                )}
              </h1>

              <p className="max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
                {heroDescription}
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
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full text-muted-foreground"
                >
                  <Link to="/anunciar">
                    <Store className="size-4" />
                    Quero vender
                  </Link>
                </Button>
              </div>

              <dl className="flex flex-wrap gap-x-10 gap-y-4 pt-2">
                {[
                  {
                    value: `${(allProducts ?? []).length}+`,
                    label: "Produtos na vitrine",
                  },
                  { value: `${categories?.length ?? "—"}`, label: "Categorias" },
                  { value: "R$", label: "Preços em reais" },
                ].map((stat) => (
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

              {heroProducts.length > 0 ? (
                heroProducts.map((product, i) => {
                  const position = [
                    "left-6 top-20 -rotate-6",
                    "left-1/2 top-4 z-10 -translate-x-1/2 rotate-2",
                    "right-6 top-28 rotate-6",
                  ][i];
                  return (
                    <motion.div
                      key={product._id}
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
                        to={`/produto/${product._id}`}
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
              ) : loading ? (
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
                ))
              ) : null}
            </div>
          </div>
        </section>

        {/* ── Ofertas relâmpago ────────────────────────────────── */}
        {browseMode && flash.length > 0 && <FlashSale products={flash} />}

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
                  {browseMode
                    ? "Navegue por categoria e deslize para ver mais produtos."
                    : category
                      ? `Mostrando produtos de ${categoryLabel(category)}`
                      : q
                        ? `Resultados para "${q}"`
                        : onlyFavorites
                          ? "Mostrando apenas os seus favoritos"
                          : hasPriceFilter
                            ? "Produtos dentro da faixa de preço escolhida"
                            : "Todos os produtos ordenados"}
                </p>
              </div>
              {!browseMode && !loading && (
                <span className="whitespace-nowrap text-sm text-muted-foreground">
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "produto" : "produtos"}
                </span>
              )}
            </div>

            {/* Barra de filtros fixa durante a rolagem */}
            <div className="sticky top-[118px] z-30 -mx-4 border-y border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:top-[64px] lg:px-8">
              <CategoryFilter
                categories={categories ?? []}
                active={category}
                onSelect={(value) => setParam("categoria", value)}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Preço
                  </span>
                  <PriceField
                    value={rawMin ?? ""}
                    placeholder="De"
                    onValue={(value) => setParam("min", value)}
                  />
                  <PriceField
                    value={rawMax ?? ""}
                    placeholder="Até"
                    onValue={(value) => setParam("max", value)}
                  />
                </div>
                <SortSelect
                  value={sort}
                  onChange={(value) => setParam("ordem", value)}
                />
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                  <Switch
                    checked={onlyFavorites}
                    onCheckedChange={(value) =>
                      setParam("favoritos", value ? "1" : null)
                    }
                  />
                  Só favoritos
                </label>
              </div>
            </div>

            {loading ? (
              browseMode ? (
                <div className="flex flex-col gap-12">
                  {[0, 1, 2].map((i) => (
                    <div key={i}>
                      <div className="mb-4 flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-44" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="flex gap-5 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div
                            key={j}
                            className="w-1/2 shrink-0 sm:w-1/3 lg:w-1/4 xl:w-1/5"
                          >
                            <ProductCardSkeleton />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title={q ? "Nenhum produto encontrado" : "Nada por aqui"}
                description={
                  q
                    ? `Não encontramos resultados para "${q}". Tente outro termo.`
                    : browseMode
                      ? "O catálogo está vazio por enquanto. Seja o primeiro a anunciar um produto."
                      : "Não há produtos nesta categoria. Tente limpar os filtros."
                }
                actionLabel={hasFilters ? "Limpar filtros" : "Anunciar produto"}
                onAction={
                  hasFilters ? clearFilters : () => navigate("/anunciar")
                }
              />
            ) : browseMode ? (
              <div className="flex flex-col gap-12">
                {(categories ?? []).length > 0 && (
                  <nav
                    aria-label="Navegar por categoria"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span className="mr-1 text-sm font-medium text-muted-foreground">
                      Ir para:
                    </span>
                    {(categories ?? []).map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Tag;
                      return (
                        <a
                          key={cat}
                          href={`#cat-${categorySlug(cat)}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <Icon className="size-3.5" />
                          {categoryLabel(cat)}
                        </a>
                      );
                    })}
                  </nav>
                )}

                {(categories ?? []).map((cat) => {
                  const items = byCategory.get(cat) ?? [];
                  if (items.length === 0) return null;
                  return (
                    <CategoryCarousel
                      key={cat}
                      category={cat}
                      products={items}
                      anchorId={`cat-${categorySlug(cat)}`}
                      onViewAll={(value) => setParam("categoria", value)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Anúncios da comunidade ───────────────────────────── */}
        {community && community.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <ProductCarousel
              products={community}
              title={
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Anúncios da comunidade
                </h2>
              }
              description="Produtos cadastrados pelos próprios vendedores do portal."
              action={
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/anunciar">
                    <Store className="size-4" />
                    Anunciar também
                  </Link>
                </Button>
              }
            />
          </section>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}

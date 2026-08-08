import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/store/FavoriteButton";
import { ErrorState } from "@/components/store/ErrorState";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { StarRating } from "@/components/store/StarRating";
import { useCart } from "@/context/cart-context";
import { ApiError, fetchProduct, fetchProducts } from "@/services/api";
import { formatPrice } from "@/lib/format";
import { categoryLabel, type Product } from "@/types/product";
import { StoreLayout } from "@/components/layout/StoreLayout";

const TRUST_ITEMS = [
  { icon: Truck, title: "Frete grátis", description: "Em todas as compras" },
  { icon: RotateCcw, title: "Devolução fácil", description: "Até 30 dias" },
  { icon: ShieldCheck, title: "Compra segura", description: "Pagamento protegido" },
];

/** Página de detalhes do produto: imagem, nome, descrição, categoria, preço e avaliação. */
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setProduct(null);
    try {
      const [productData, productsData] = await Promise.all([
        fetchProduct(id as string),
        fetchProducts(),
      ]);
      setProduct(productData);
      setAllProducts(productsData);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      }
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao carregar o produto.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setQuantity(1);
    load();
  }, [load]);

  const related = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(
        (p) => p.category === product.category && p.id !== product.id,
      )
      .slice(0, 4);
  }, [product, allProducts]);

  return (
    <StoreLayout>
      {loading ? (
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      ) : error || !product ? (
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <ErrorState
            message={
              notFound
                ? "Produto não encontrado. Ele pode ter sido removido do catálogo."
                : error ?? "Não foi possível carregar este produto."
            }
            onRetry={() => (notFound ? navigate("/") : load())}
          />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Trilha de navegação"
            className="mb-6 flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground"
          >
            <Link to="/" className="whitespace-nowrap transition-colors hover:text-primary">
              Início
            </Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link
              to={`/?categoria=${encodeURIComponent(product.category)}`}
              className="whitespace-nowrap transition-colors hover:text-primary"
            >
              {categoryLabel(product.category)}
            </Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="truncate text-foreground">{product.title}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Imagem */}
            <div>
              <div className="sticky top-24 rounded-2xl border border-border/70 bg-white p-6 sm:p-10">
                <ProductImage
                  src={product.image}
                  alt={product.title}
                  className="aspect-square w-full"
                  imgClassName="transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>

            {/* Informações */}
            <div className="space-y-6">
              <div>
                <Badge
                  variant="outline"
                  className="mb-3 w-fit text-muted-foreground"
                >
                  {categoryLabel(product.category)}
                </Badge>
                <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
                  {product.title}
                </h1>
              </div>

              <StarRating rate={product.rating.rate} count={product.rating.count} />

              <p className="font-serif text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>

              <p className="leading-7 text-muted-foreground">
                {product.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 border-y border-border py-5">
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                />
                <Button
                  size="lg"
                  className="min-w-48 flex-1 rounded-full"
                  onClick={() => addItem(product, quantity)}
                >
                  <ShoppingBag className="size-4" />
                  Adicionar ao carrinho
                </Button>
                <FavoriteButton
                  productId={product.id}
                  size="icon-lg"
                  className="border border-border bg-background"
                />
              </div>

              <ul className="grid gap-3 sm:grid-cols-3">
                {TRUST_ITEMS.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <item.icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {item.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Relacionados */}
          {related.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">
                    Você também pode gostar
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Produtos da mesma categoria
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden rounded-full text-muted-foreground sm:inline-flex"
                >
                  <Link
                    to={`/?categoria=${encodeURIComponent(product.category)}`}
                  >
                    Ver todos
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </StoreLayout>
  );
}

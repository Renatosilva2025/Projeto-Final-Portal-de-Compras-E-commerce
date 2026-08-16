import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowRight,
  ChevronRight,
  MessageCircle,
  MessageSquareText,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FavoriteButton } from "@/components/store/FavoriteButton";
import { ErrorState } from "@/components/store/ErrorState";
import { ProductCarousel } from "@/components/store/ProductCarousel";
import { ProductImage } from "@/components/store/ProductImage";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { StarRating } from "@/components/store/StarRating";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/cart-context";
import { hasDiscount, PRODUCT_TAG_STYLES, productTags } from "@/lib/product-tags";
import { cn } from "@/lib/utils";
import { formatDate, formatPrice } from "@/lib/format";
import { categoryLabel } from "@/types/product";

/** Número do WhatsApp do vendedor (formato internacional, sem espaços). */
const WHATSAPP_NUMBER = "5511999999999";

const TRUST_ITEMS = [
  { icon: Truck, title: "Frete grátis", description: "Em todas as compras" },
  { icon: RotateCcw, title: "Devolução fácil", description: "Até 30 dias" },
  { icon: ShieldCheck, title: "Compra segura", description: "Pagamento protegido" },
];

/** Página de detalhes do produto: imagem, informações, avaliações e relacionados. */
export default function ProductPage() {
  const { id } = useParams();
  const productId = id as Id<"products">;
  const isValidId = typeof id === "string" && /^[A-Za-z0-9]{10,}$/.test(id);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();

  const product = useQuery(api.products.get, isValidId ? { id: productId } : "skip");
  const reviews = useQuery(api.reviews.listByProduct, isValidId ? { productId } : "skip");
  const allProducts = useQuery(api.products.list, {});

  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const addReview = useMutation(api.reviews.addReview);
  const removeReview = useMutation(api.reviews.removeReview);

  const isOwner = product?.sellerId === user?._id;
  const canSeeInactive =
    !product ||
    product.status === "active" ||
    isOwner ||
    user?.role === "admin";

  const related = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter((p) => p.category === product.category && p._id !== product._id)
      .slice(0, 4);
  }, [product, allProducts]);

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Escolha uma nota de 1 a 5 estrelas.");
      return;
    }
    setSubmitting(true);
    try {
      await addReview({ productId, rating, comment });
      toast.success("Avaliação publicada com sucesso!");
      setComment("");
      setRating(0);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível avaliar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveReview = async (reviewId: Id<"reviews">) => {
    try {
      await removeReview({ id: reviewId });
      toast.success("Avaliação removida.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.title, url });
        return;
      }
    } catch {
      // compartilhamento nativo cancelado — segue para copiar o link
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  if (!isValidId) {
    return (
      <StoreLayout>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <ErrorState
            message="Produto não encontrado. Ele pode ter sido removido do catálogo."
            onRetry={() => navigate("/")}
          />
        </div>
      </StoreLayout>
    );
  }

  if (product === undefined) {
    return (
      <StoreLayout>
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
      </StoreLayout>
    );
  }

  if (!product || !canSeeInactive) {
    return (
      <StoreLayout>
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <ErrorState
            message={
              product
                ? "Este anúncio está pausado e não está mais disponível para compra."
                : "Produto não encontrado. Ele pode ter sido removido do catálogo."
            }
            onRetry={() => navigate("/")}
          />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
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
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="w-fit text-muted-foreground"
                >
                  {categoryLabel(product.category)}
                </Badge>
                {productTags(product).map((tag) => (
                  <Badge
                    key={tag}
                    className={`w-fit border-0 ${PRODUCT_TAG_STYLES[tag]}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {product.sellerId && (
                  <Badge
                    variant="secondary"
                    className="w-fit gap-1 text-muted-foreground"
                  >
                    <Store className="size-3" />
                    {isOwner ? "Seu anúncio" : "Anúncio de vendedor(a)"}
                  </Badge>
                )}
                {product.status === "inactive" && (
                  <Badge variant="destructive" className="w-fit">
                    Anúncio pausado
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
                {product.title}
              </h1>
            </div>

            <StarRating rate={product.rating.rate} count={product.rating.count} />

            <div className="flex flex-wrap items-baseline gap-3">
              {hasDiscount(product) && (
                <p className="text-lg font-medium text-muted-foreground line-through">
                  {formatPrice(product.oldPrice as number)}
                </p>
              )}
              <p className="font-serif text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="leading-7 text-muted-foreground">
              {product.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 border-y border-border py-5">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.max(1, product.stock)}
              />
              <Button
                size="lg"
                className="min-w-48 flex-1 rounded-full"
                disabled={product.stock <= 0}
                onClick={() => addItem(product, quantity)}
              >
                <ShoppingBag className="size-4" />
                {product.stock <= 0
                  ? "Esgotado"
                  : "Adicionar ao carrinho"}
              </Button>
              <FavoriteButton
                productId={product._id}
                size="icon-lg"
                className="border border-border bg-background"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 rounded-full border-emerald-600/40 bg-emerald-50/60 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 sm:flex-none"
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    `Olá! Tenho interesse no produto "${product.title}" (${formatPrice(product.price)}) do Portal de Compras PD.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Consultar no WhatsApp
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
                Compartilhar
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? (
                <>
                  <span className="font-semibold text-emerald-600">
                    Em estoque
                  </span>{" "}
                  · {product.stock}{" "}
                  {product.stock === 1 ? "unidade disponível" : "unidades disponíveis"}
                </>
              ) : (
                <span className="font-semibold text-destructive">
                  Produto esgotado
                </span>
              )}
            </p>

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

        {/* Avaliações */}
        <section className="mt-16 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
              <MessageSquareText className="size-5 text-primary" />
              Avaliações
              {reviews && reviews.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {reviews.length}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Veja o que outros clientes acham deste produto.
            </p>

            <div className="mt-6 space-y-4">
              {reviews === undefined ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma avaliação ainda. Seja a primeira pessoa a comentar!
                </div>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {review.authorName.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="truncate text-sm font-semibold">
                            {review.authorName}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <StarRating rate={review.rating} />
                          <span className="text-xs text-muted-foreground">
                            {formatDate(review._creationTime)}
                          </span>
                        </div>
                      </div>
                      {(review.userId === user?._id || user?.role === "admin") && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover avaliação"
                          className="rounded-full text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveReview(review._id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {review.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Formulário de avaliação */}
          <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-24">
            <h3 className="font-serif text-lg font-bold">Avalie este produto</h3>
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                <div>
                  <span className="mb-2 block text-sm font-medium">
                    Sua nota
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} estrela${value > 1 ? "s" : ""}`}
                        onClick={() => setRating(value)}
                        className="rounded-full p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "size-6 transition-colors",
                            value <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="comment"
                    className="mb-2 block text-sm font-medium"
                  >
                    Comentário
                  </label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Conte sua experiência com o produto…"
                    rows={4}
                    maxLength={1000}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Enviando…" : "Publicar avaliação"}
                </Button>
              </form>
            ) : (
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  Entre na sua conta para avaliar produtos e comentar suas
                  experiências.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full"
                >
                  <Link to={`/auth?returnTo=${encodeURIComponent(`/produto/${product._id}`)}`}>
                    Entrar para avaliar
                  </Link>
                </Button>
              </div>
            )}
          </aside>
        </section>

        {/* Relacionados */}
        {related.length > 0 && (
          <section className="mt-16">
            <ProductCarousel
              products={related}
              title={
                <h2 className="font-serif text-2xl font-bold">
                  Você também pode gostar
                </h2>
              }
              description="Produtos da mesma categoria"
              action={
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
              }
            />
          </section>
        )}
      </div>
    </StoreLayout>
  );
}

import { useEffect, useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { hasDiscount, PRODUCT_TAG_STYLES, productTags } from "@/lib/product-tags";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { FavoriteButton } from "./FavoriteButton";
import { ProductImage } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";
import { StarRating } from "./StarRating";

/** Modal de visão rápida — detalhes essenciais sem sair da vitrine. */
export function ProductQuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) setQuantity(1);
  }, [open]);

  if (!product) return null;

  const tags = productTags(product);
  const discount = hasDiscount(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes rápidos de {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-white p-4">
            <ProductImage
              src={product.image}
              alt={product.title}
              className="aspect-square w-full rounded-xl"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="w-fit text-[11px] font-medium text-muted-foreground"
              >
                {categoryLabel(product.category)}
              </Badge>
              {tags.map((tag) => (
                <Badge key={tag} className={`border-0 ${PRODUCT_TAG_STYLES[tag]}`}>
                  {tag}
                </Badge>
              ))}
            </div>

            <Link
              to={`/produto/${product._id}`}
              onClick={() => onOpenChange(false)}
              className="font-serif text-xl font-bold leading-snug transition-colors hover:text-primary"
            >
              {product.title}
            </Link>

            <StarRating rate={product.rating.rate} count={product.rating.count} />

            <div className="flex flex-wrap items-baseline gap-2">
              {discount && (
                <span className="text-sm font-medium text-muted-foreground line-through">
                  {formatPrice(product.oldPrice as number)}
                </span>
              )}
              <span className="text-2xl font-bold tracking-tight text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>

            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? (
                <>
                  <span className="font-semibold text-emerald-600">Em estoque</span>{" "}
                  · {product.stock}{" "}
                  {product.stock === 1 ? "unidade disponível" : "unidades disponíveis"}
                </>
              ) : (
                <span className="font-semibold text-destructive">Produto esgotado</span>
              )}
            </p>

            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.max(1, product.stock)}
              />
              <Button
                type="button"
                className="min-w-40 flex-1 rounded-full"
                disabled={product.stock <= 0}
                onClick={() => addItem(product, quantity)}
              >
                <ShoppingBag className="size-4" />
                Adicionar ao carrinho
              </Button>
              <FavoriteButton
                productId={product._id}
                size="icon-lg"
                className="border border-border bg-background"
              />
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full rounded-full"
            >
              <Link
                to={`/produto/${product._id}`}
                onClick={() => onOpenChange(false)}
              >
                <Eye className="size-4" />
                Ver página completa
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

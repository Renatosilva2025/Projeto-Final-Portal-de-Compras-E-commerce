import { motion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { FavoriteButton } from "./FavoriteButton";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";

/** Card de produto: imagem, nome, categoria, preço formatado, avaliação e ações. */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group relative flex h-full flex-col overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
        <FavoriteButton
          productId={product.id}
          className="absolute right-3 top-3 z-10 bg-background/70 backdrop-blur-sm"
        />
        <Link
          to={`/produto/${product.id}`}
          className="block p-4 sm:p-5"
          aria-label={`Ver detalhes de ${product.title}`}
        >
          <ProductImage
            src={product.image}
            alt={product.title}
            className="aspect-square w-full rounded-lg transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
          <Badge
            variant="outline"
            className="w-fit text-[11px] font-medium text-muted-foreground"
          >
            {categoryLabel(product.category)}
          </Badge>
          <Link
            to={`/produto/${product.id}`}
            className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
          >
            {product.title}
          </Link>
          <StarRating rate={product.rating.rate} count={product.rating.count} />
          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <p className="text-xl font-bold tracking-tight text-primary">
              {formatPrice(product.price)}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Ver detalhes"
                className="rounded-full text-muted-foreground"
              >
                <Link to={`/produto/${product.id}`}>
                  <Eye className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                size="icon"
                aria-label={`Adicionar ${product.title} ao carrinho`}
                className="rounded-full shadow-sm"
                onClick={() => addItem(product)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

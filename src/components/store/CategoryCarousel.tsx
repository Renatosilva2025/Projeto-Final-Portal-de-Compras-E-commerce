import { ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { CATEGORY_ICONS } from "./category-icons";
import { ProductCarousel } from "./ProductCarousel";

interface CategoryCarouselProps {
  category: string;
  products: Product[];
  onViewAll: (category: string) => void;
  /** Id da âncora usado pelo menu "Ir para" da vitrine. */
  anchorId?: string;
}

/** Carrossel horizontal com os produtos de uma categoria (estilo marketplace). */
export function CategoryCarousel({
  category,
  products,
  onViewAll,
  anchorId,
}: CategoryCarouselProps) {
  const Icon = CATEGORY_ICONS[category.toLowerCase()] ?? Tag;

  return (
    <ProductCarousel
      id={anchorId}
      products={products}
      title={
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
            <Icon className="size-5" />
          </span>
          <h3 className="truncate font-serif text-xl font-bold sm:text-2xl">
            {categoryLabel(category)}
          </h3>
        </div>
      }
      description={`${products.length} ${
        products.length === 1 ? "produto" : "produtos"
      }`}
      action={
        <Button
          type="button"
          variant="ghost"
          className="hidden rounded-full text-sm text-muted-foreground hover:text-primary sm:inline-flex"
          onClick={() => onViewAll(category)}
        >
          Ver todos
          <ArrowRight className="size-4" />
        </Button>
      }
    />
  );
}

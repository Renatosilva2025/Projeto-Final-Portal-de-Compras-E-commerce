import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { categoryLabel } from "@/types/product";
import type { Product } from "@/types/product";
import { CATEGORY_ICONS } from "./category-icons";
import { ProductCard } from "./ProductCard";

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
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  const Icon = CATEGORY_ICONS[category.toLowerCase()] ?? Tag;

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", dragFree: true }}
      className="w-full scroll-mt-24"
      id={anchorId}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-serif text-xl font-bold sm:text-2xl">
              {categoryLabel(category)}
            </h3>
            <p className="text-xs text-muted-foreground">
              {products.length} {products.length === 1 ? "produto" : "produtos"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="hidden rounded-full text-sm text-muted-foreground hover:text-primary sm:inline-flex"
            onClick={() => onViewAll(category)}
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Produtos anteriores"
            className="size-8 rounded-full"
            disabled={!canPrev}
            onClick={() => api?.scrollPrev()}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Próximos produtos"
            className="size-8 rounded-full"
            disabled={!canNext}
            onClick={() => api?.scrollNext()}
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            key={product._id}
            className="basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5"
          >
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

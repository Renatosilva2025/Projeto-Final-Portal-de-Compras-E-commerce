import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  products: Product[];
  /** Cabeçalho à esquerda (título, ícone, etc.). */
  title: ReactNode;
  /** Texto de apoio abaixo do título. */
  description?: ReactNode;
  /** Ação à direita do cabeçalho (ex.: botão "Ver todos"). */
  action?: ReactNode;
  /** Id da âncora para navegação direta. */
  id?: string;
  className?: string;
}

/** Carrossel horizontal de produtos com cabeçalho e setas (estilo marketplace). */
export function ProductCarousel({
  products,
  title,
  description,
  action,
  id,
  className,
}: ProductCarouselProps) {
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

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", dragFree: true }}
      id={id}
      className={cn("w-full scroll-mt-24", className)}
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {title}
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {action}
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

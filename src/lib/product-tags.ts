import type { Product } from "@/types/product";

/** Selos de vitrine exibidos nos cards e na página do produto. */
export const PRODUCT_TAGS = ["Novo", "Oferta", "Esgotando"] as const;
export type ProductTag = (typeof PRODUCT_TAGS)[number];

/** Classes Tailwind por selo (cor de destaque na vitrine). */
export const PRODUCT_TAG_STYLES: Record<ProductTag, string> = {
  Novo: "bg-sky-500 text-white",
  Oferta: "bg-amber-500 text-white",
  Esgotando: "bg-zinc-700 text-white",
};

/**
 * Selos efetivos de um produto: os escolhidos pelo vendedor, somados aos
 * derivados automaticamente — "Oferta" quando há preço antigo maior que o
 * atual e "Esgotando" quando o estoque está no fim.
 */
export function productTags(product: Product): ProductTag[] {
  const tags = new Set<ProductTag>();
  if (Array.isArray(product.tags)) {
    for (const tag of product.tags) {
      if ((PRODUCT_TAGS as readonly string[]).includes(tag)) {
        tags.add(tag as ProductTag);
      }
    }
  }
  if (
    product.oldPrice !== undefined &&
    product.oldPrice > product.price &&
    !tags.has("Oferta")
  ) {
    tags.add("Oferta");
  }
  if (product.stock > 0 && product.stock <= 3 && !tags.has("Esgotando")) {
    tags.add("Esgotando");
  }
  return [...tags];
}

/** O produto está em promoção (preço antigo riscado)? */
export function hasDiscount(product: Product): boolean {
  return (
    product.oldPrice !== undefined && product.oldPrice > product.price
  );
}

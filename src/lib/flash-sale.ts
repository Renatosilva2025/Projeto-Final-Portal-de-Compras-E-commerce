import { hasDiscount } from "./product-tags";
import type { Product } from "@/types/product";

/** Duração de cada leva de ofertas relâmpago (12h, ciclo contínuo). */
export const FLASH_WINDOW_MS = 12 * 60 * 60 * 1000;

/**
 * Fim da leva atual: o próximo múltiplo da janela desde a época Unix.
 * Quando o contador zera, a próxima leva começa automaticamente.
 */
export function flashWindowEnd(now = Date.now()): number {
  return (Math.floor(now / FLASH_WINDOW_MS) + 1) * FLASH_WINDOW_MS;
}

/** Percentual de desconto do produto (0 quando não está em oferta). */
export function discountPercent(product: Product): number {
  if (!hasDiscount(product)) return 0;
  return ((product.oldPrice as number) - product.price) / product.oldPrice! * 100;
}

/**
 * Produtos em oferta para a vitrine relâmpago: apenas os com preço antigo,
 * ordenados do maior para o menor desconto percentual.
 */
export function flashProducts(
  products: Product[],
  limit = 10,
): Product[] {
  return [...products]
    .filter(hasDiscount)
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, limit);
}

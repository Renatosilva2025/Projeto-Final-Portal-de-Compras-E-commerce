import type { Doc } from "@/convex/_generated/dataModel";

/** Produto do catálogo, armazenado no Convex. */
export type Product = Doc<"products">;

/** Avaliação/comentário de um produto. */
export type Review = Doc<"reviews">;

/** Pedido realizado por um cliente. */
export type Order = Doc<"orders">;

/** Item do carrinho: produto + quantidade. */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Categorias disponíveis no formulário de anúncio (espelho do backend). */
export const PRODUCT_CATEGORIES = [
  "Acessórios para celular",
  "Carregadores e cabos",
  "Notebooks e computadores",
  "Áudio e fones de ouvido",
  "Smartphones e tablets",
  "Eletrônicos e gadgets",
  "Moda e acessórios",
  "Casa e decoração",
] as const;

/** Nomes amigáveis em português para categorias legadas (Fake Store API). */
export const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Eletrônicos",
  jewelery: "Joias",
  "men's clothing": "Roupas Masculinas",
  "women's clothing": "Roupas Femininas",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category.toLowerCase()] ?? category;
}

/** Situações de um pedido com rótulo em português. */
export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_ORDER = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/** Métodos de pagamento aceitos no checkout (compra simulada). */
export const PAYMENT_METHODS = [
  { value: "pix", label: "Pix", hint: "Pagamento instantâneo" },
  { value: "credit", label: "Cartão de crédito", hint: "Até 12x sem juros" },
  { value: "boleto", label: "Boleto bancário", hint: "Vence em 3 dias úteis" },
] as const;

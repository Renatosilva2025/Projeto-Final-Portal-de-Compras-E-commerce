const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata um preço em reais (R$) usando o locale pt-BR. */
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

/** Formata uma data (timestamp) no padrão brasileiro. */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

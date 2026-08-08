const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
});

/** Formata um preço em moeda (US$) usando o locale pt-BR. */
export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

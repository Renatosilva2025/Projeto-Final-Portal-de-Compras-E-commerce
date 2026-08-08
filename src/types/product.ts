/** Produto retornado pela Fake Store API. */
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

/** Item do carrinho: produto + quantidade. */
export interface CartItem {
  product: Product;
  quantity: number;
}

/** Nomes amigáveis em português para as categorias da Fake Store API. */
export const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Eletrônicos",
  jewelery: "Joias",
  "men's clothing": "Roupas Masculinas",
  "women's clothing": "Roupas Femininas",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category.toLowerCase()] ?? category;
}

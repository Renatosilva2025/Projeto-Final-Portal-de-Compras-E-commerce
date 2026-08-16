import { describe, expect, test } from "bun:test";
import { hasDiscount, productTags } from "./product-tags";
import type { Product } from "@/types/product";

/** Produto mínimo de teste; sobrescreva os campos que quiser. */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: "p-teste",
    _creationTime: 0,
    title: "Produto de teste",
    description: "Descrição de teste",
    price: 10,
    category: "Acessórios para celular",
    image: "https://exemplo.com/img.jpg",
    rating: { rate: 0, count: 0 },
    stock: 10,
    status: "active",
    ...overrides,
  } as Product;
}

describe("productTags", () => {
  test("sem selos nem preço antigo → lista vazia", () => {
    expect(productTags(makeProduct())).toEqual([]);
  });

  test("preserva selos explícitos", () => {
    expect(
      productTags(makeProduct({ tags: ["Novo", "Oferta"] })),
    ).toEqual(["Novo", "Oferta"]);
  });

  test("remove selos desconhecidos e duplicados", () => {
    expect(
      productTags(makeProduct({ tags: ["Novo", "Novo", "Lancamento"] })),
    ).toEqual(["Novo"]);
  });

  test("preço antigo maior que o atual adiciona 'Oferta' implicitamente", () => {
    const product = makeProduct({ oldPrice: 15, tags: [] });
    expect(productTags(product)).toContain("Oferta");
  });

  test("preço antigo menor/igual ao atual não gera 'Oferta'", () => {
    expect(
      productTags(makeProduct({ oldPrice: 10, tags: [] })),
    ).not.toContain("Oferta");
    expect(
      productTags(makeProduct({ oldPrice: 5, tags: [] })),
    ).not.toContain("Oferta");
  });

  test("estoque entre 1 e 3 adiciona 'Esgotando' implicitamente", () => {
    for (const stock of [1, 2, 3]) {
      expect(productTags(makeProduct({ stock, tags: [] }))).toContain(
        "Esgotando",
      );
    }
  });

  test("estoque zerado não gera 'Esgotando' (apenas o selo explícito)", () => {
    expect(productTags(makeProduct({ stock: 0, tags: [] }))).toEqual([]);
    expect(
      productTags(makeProduct({ stock: 0, tags: ["Esgotando"] })),
    ).toEqual(["Esgotando"]);
  });

  test("não duplica selo implícito quando o selo já foi escolhido", () => {
    const product = makeProduct({ oldPrice: 15, stock: 2, tags: ["Oferta", "Esgotando"] });
    expect(productTags(product)).toEqual(["Oferta", "Esgotando"]);
  });
});

describe("hasDiscount", () => {
  test("true quando o preço antigo é maior que o atual", () => {
    expect(hasDiscount(makeProduct({ oldPrice: 20 }))).toBe(true);
  });

  test("false sem preço antigo", () => {
    expect(hasDiscount(makeProduct())).toBe(false);
  });

  test("false quando o preço antigo não é maior", () => {
    expect(hasDiscount(makeProduct({ oldPrice: 10 }))).toBe(false);
    expect(hasDiscount(makeProduct({ oldPrice: 5 }))).toBe(false);
  });
});

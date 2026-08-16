import { describe, expect, test } from "bun:test";
import {
  discountPercent,
  FLASH_WINDOW_MS,
  flashProducts,
  flashWindowEnd,
} from "./flash-sale";
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

describe("flashWindowEnd", () => {
  test("no início da época a leva termina na primeira janela (12h)", () => {
    expect(flashWindowEnd(0)).toBe(FLASH_WINDOW_MS);
  });

  test("um ms antes do fim aponta para o mesmo fim da leva", () => {
    const end = flashWindowEnd(0);
    expect(flashWindowEnd(end - 1)).toBe(end);
  });

  test("exatamente no fim aponta para a leva seguinte", () => {
    const end = flashWindowEnd(0);
    expect(flashWindowEnd(end)).toBe(end + FLASH_WINDOW_MS);
  });

  test("sempre retorna um múltiplo da janela maior que o agora", () => {
    const now = 1_700_000_000_000;
    const end = flashWindowEnd(now);
    expect(end % FLASH_WINDOW_MS).toBe(0);
    expect(end).toBeGreaterThan(now);
    expect(end - now).toBeLessThanOrEqual(FLASH_WINDOW_MS);
  });
});

describe("discountPercent", () => {
  test("calcula o percentual sobre o preço antigo", () => {
    expect(discountPercent(makeProduct({ price: 80, oldPrice: 100 }))).toBe(
      20,
    );
  });

  test("zero sem preço antigo ou sem desconto real", () => {
    expect(discountPercent(makeProduct())).toBe(0);
    expect(discountPercent(makeProduct({ price: 100, oldPrice: 100 }))).toBe(0);
  });
});

describe("flashProducts", () => {
  test("mantém apenas produtos com desconto, ordenados do maior para o menor", () => {
    const p30 = makeProduct({ _id: "a" as Product["_id"], price: 70, oldPrice: 100 });
    const p50 = makeProduct({ _id: "b" as Product["_id"], price: 50, oldPrice: 100 });
    const normal = makeProduct({ _id: "c" as Product["_id"] });
    expect(flashProducts([normal, p30, p50])).toEqual([p50, p30]);
  });

  test("respeita o limite", () => {
    const items = [1, 2, 3].map((i) =>
      makeProduct({ _id: `p${i}` as Product["_id"], price: 90, oldPrice: 100 }),
    );
    expect(flashProducts(items, 2)).toHaveLength(2);
  });

  test("lista vazia quando nada está em oferta", () => {
    expect(flashProducts([makeProduct()])).toEqual([]);
  });
});

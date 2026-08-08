import type { Product } from "@/types/product";

const API_BASE = "https://fakestoreapi.com";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Cliente leve da Fake Store API (Fetch API).
 * Lança ApiError com mensagem amigável para tratamento de erros na UI.
 */
async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ApiError(
        `Não foi possível carregar os dados (status ${response.status}).`,
        response.status,
      );
    }
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("A requisição demorou demais. Tente novamente.");
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Falha de conexão com a Fake Store API. Verifique sua internet.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** Lista todos os produtos. */
export function fetchProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

/** Busca um produto pelo id. */
export function fetchProduct(id: number | string): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

/** Lista as categorias disponíveis. */
export function fetchCategories(): Promise<string[]> {
  return request<string[]>("/products/categories");
}

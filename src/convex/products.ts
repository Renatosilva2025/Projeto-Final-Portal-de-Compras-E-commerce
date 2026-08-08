import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser, isAdminUser } from "./users";

/** Categorias do catálogo (estilo marketplace de eletrônicos e acessórios). */
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

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

const FAKE_STORE_URL = "https://fakestoreapi.com/products";

const FAKE_CATEGORY_MAP: Record<string, string> = {
  electronics: "Eletrônicos e gadgets",
  jewelery: "Moda e acessórios",
  "men's clothing": "Moda e acessórios",
  "women's clothing": "Moda e acessórios",
};

/** Anúncios curados do tipo que o portal vende: capa, carregador, notebook, fone… */
const CURATED_PRODUCTS = [
  {
    title: "Capa de celular para iPhone 15 Pro — silicone transparente",
    description:
      "Capa fina de silicone fosco com proteção contra quedas e arranhões. Compatível com carregamento sem fio e botões de fácil acesso.",
    price: 12.9,
    category: "Acessórios para celular",
    image: "https://picsum.photos/seed/portal-capa-iphone/600/600",
  },
  {
    title: "Carregador USB-C Turbo 30W com cabo incluso",
    description:
      "Carregador rápido de 30W com tecnologia GaN, compacto e eficiente. Carrega smartphones e notebooks USB-C com segurança.",
    price: 18.9,
    category: "Carregadores e cabos",
    image: "https://picsum.photos/seed/portal-carregador/600/600",
  },
  {
    title: "Notebook ultrafino 15.6\" — 16 GB RAM, 512 GB SSD",
    description:
      "Notebook leve e rápido para estudos e trabalho. Tela Full HD, teclado ABNT2 e bateria de longa duração.",
    price: 649.9,
    category: "Notebooks e computadores",
    image: "https://picsum.photos/seed/portal-notebook/600/600",
  },
  {
    title: "Fone de ouvido Bluetooth com cancelamento de ruído",
    description:
      "Fone sem fio com cancelamento ativo de ruído, 30 horas de bateria e estojo de carregamento portátil.",
    price: 59.9,
    category: "Áudio e fones de ouvido",
    image: "https://picsum.photos/seed/portal-fone/600/600",
  },
  {
    title: "Película de vidro temperado 9H (2 unidades)",
    description:
      "Proteção de vidro temperado com alta resistência a riscos e impactos. Instalação simples, livre de bolhas.",
    price: 6.9,
    category: "Acessórios para celular",
    image: "https://picsum.photos/seed/portal-pelicula/600/600",
  },
  {
    title: "Smartphone Android 6.5\" 128 GB + carregador",
    description:
      "Smartphone com tela de 6.5 polegadas, 128 GB de armazenamento e câmera dupla. Acompanha carregador e capa protetora.",
    price: 249.9,
    category: "Smartphones e tablets",
    image: "https://picsum.photos/seed/portal-smartphone/600/600",
  },
];

/** Converte uma imagem armazenada (storageId) em URL pública. */
type StorageCtx = {
  storage: { getUrl: (storageId: string) => Promise<string | null> };
};

async function resolveProduct(
  ctx: StorageCtx,
  product: Doc<"products">,
): Promise<Doc<"products">> {
  if (product.image.startsWith("http")) return product;
  const url = await ctx.storage.getUrl(product.image);
  return { ...product, image: url ?? "" };
}

/** Total de produtos no catálogo (usado para saber se a semeadura já rodou). */
export const count = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.length;
  },
});

/** Lista os produtos ativos do catálogo, com filtro opcional por categoria. */
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    const products = await ctx.db.query("products").collect();
    let list = products
      .filter((p) => p.status === "active")
      .sort((a, b) => b._creationTime - a._creationTime);

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    return Promise.all(list.map((p) => resolveProduct(ctx, p)));
  },
});

/** Anúncios criados pelos próprios usuários (vendedores da comunidade). */
export const listCommunity = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const list = products
      .filter((p) => p.sellerId !== undefined && p.status === "active")
      .sort((a, b) => b._creationTime - a._creationTime);
    return Promise.all(list.map((p) => resolveProduct(ctx, p)));
  },
});

/** Anúncios do usuário logado (inclui pausados). */
export const myProducts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const products = await ctx.db.query("products").collect();
    const list = products
      .filter((p) => p.sellerId === user._id)
      .sort((a, b) => b._creationTime - a._creationTime);
    return Promise.all(list.map((p) => resolveProduct(ctx, p)));
  },
});

/** Busca um produto pelo id. */
export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;
    return resolveProduct(ctx, product);
  },
});

/** Todos os produtos, inclusive pausados (apenas administradores). */
export const listAllProducts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) throw new Error("Acesso restrito a administradores.");

    const products = await ctx.db.query("products").collect();
    const list = products.sort((a, b) => b._creationTime - a._creationTime);
    return Promise.all(list.map((p) => resolveProduct(ctx, p)));
  },
});

/** Categorias distintas presentes no catálogo. */
export const categories = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return [...new Set(products.map((p) => p.category))];
  },
});

/** Gera uma URL de upload para a imagem de um anúncio. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado para anunciar.");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Cria um novo anúncio (qualquer usuário logado). */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    image: v.string(),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado para anunciar.");

    const title = args.title.trim();
    const description = args.description.trim();
    if (!title) throw new Error("Informe o título do anúncio.");
    if (!description) throw new Error("Informe a descrição do anúncio.");
    if (!args.price || args.price <= 0) throw new Error("Informe um preço válido.");
    if (!args.category) throw new Error("Escolha uma categoria.");
    if (args.stock < 0) throw new Error("O estoque não pode ser negativo.");
    if (!args.image) throw new Error("Adicione uma imagem ao anúncio.");

    return await ctx.db.insert("products", {
      title,
      description,
      price: args.price,
      category: args.category,
      image: args.image,
      rating: { rate: 0, count: 0 },
      sellerId: user._id,
      stock: Math.floor(args.stock),
      status: "active",
    });
  },
});

/** Edita um anúncio (dono ou administrador). */
export const update = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    image: v.optional(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado.");

    const product = await ctx.db.get(id);
    if (!product) throw new Error("Anúncio não encontrado.");
    if (product.sellerId !== user._id && !isAdminUser(user)) {
      throw new Error("Você não tem permissão para editar este anúncio.");
    }

    const next: Record<string, unknown> = {};
    if (patch.title !== undefined) {
      const title = patch.title.trim();
      if (!title) throw new Error("Informe o título do anúncio.");
      next.title = title;
    }
    if (patch.description !== undefined) {
      const description = patch.description.trim();
      if (!description) throw new Error("Informe a descrição do anúncio.");
      next.description = description;
    }
    if (patch.price !== undefined) {
      if (patch.price <= 0) throw new Error("Informe um preço válido.");
      next.price = patch.price;
    }
    if (patch.category !== undefined) next.category = patch.category;
    if (patch.image !== undefined) {
      if (!patch.image) throw new Error("Adicione uma imagem ao anúncio.");
      next.image = patch.image;
    }
    if (patch.stock !== undefined) {
      if (patch.stock < 0) throw new Error("O estoque não pode ser negativo.");
      next.stock = Math.floor(patch.stock);
    }

    await ctx.db.patch(id, next);
  },
});

/** Pausa ou reativa um anúncio (dono ou administrador). */
export const toggleStatus = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado.");

    const product = await ctx.db.get(id);
    if (!product) throw new Error("Anúncio não encontrado.");
    if (product.sellerId !== user._id && !isAdminUser(user)) {
      throw new Error("Você não tem permissão para alterar este anúncio.");
    }

    await ctx.db.patch(id, {
      status: product.status === "active" ? "inactive" : "active",
    });
  },
});

/** Remove um anúncio (dono ou administrador). */
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado.");

    const product = await ctx.db.get(id);
    if (!product) throw new Error("Anúncio não encontrado.");
    if (product.sellerId !== user._id && !isAdminUser(user)) {
      throw new Error("Você não tem permissão para remover este anúncio.");
    }

    await ctx.db.delete(id);
  },
});

const seedProductValidator = v.object({
  title: v.string(),
  description: v.string(),
  price: v.number(),
  category: v.string(),
  image: v.string(),
  rating: v.object({ rate: v.number(), count: v.number() }),
  stock: v.number(),
  status: v.union(v.literal("active"), v.literal("inactive")),
});

/** Conta interna usada pela ação de semeadura. */
export const countInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.length;
  },
});

/** Inserção em lote usada pela ação de semeadura. */
export const bulkInsert = internalMutation({
  args: { products: v.array(seedProductValidator) },
  handler: async (ctx, { products }) => {
    for (const p of products) {
      await ctx.db.insert("products", p);
    }
    return products.length;
  },
});

/**
 * Semeia o catálogo a partir da Fake Store API + anúncios curados.
 * Executa apenas uma vez (quando não existe nenhum produto).
 */
export const seed = action({
  args: {},
  handler: async (ctx): Promise<{ inserted: number }> => {
    const count = await ctx.runQuery(internal.products.countInternal);
    if (count > 0) return { inserted: 0 };

    const products: Array<{
      title: string;
      description: string;
      price: number;
      category: string;
      image: string;
      rating: { rate: number; count: number };
      stock: number;
      status: "active";
    }> = CURATED_PRODUCTS.map((p) => ({
      title: p.title,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      rating: { rate: 0, count: 0 },
      stock: 100,
      status: "active",
    }));

    try {
      const response = await fetch(FAKE_STORE_URL);
      if (!response.ok) throw new Error(`Fake Store API: ${response.status}`);
      const data = (await response.json()) as Array<{
        title: string;
        description: string;
        price: number;
        category: string;
        image: string;
        rating?: { rate?: number; count?: number };
      }>;

      for (const p of data) {
        products.push({
          title: p.title,
          description: p.description,
          price: p.price,
          category: FAKE_CATEGORY_MAP[p.category] ?? p.category,
          image: p.image,
          rating: {
            rate: p.rating?.rate ?? 0,
            count: p.rating?.count ?? 0,
          },
          stock: 50,
          status: "active",
        });
      }
    } catch (err) {
      console.error("Não foi possível carregar a Fake Store API:", err);
    }

    const inserted = await ctx.runMutation(internal.products.bulkInsert, {
      products,
    });
    return { inserted };
  },
});

import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

/** Situações de um pedido, do pagamento até a entrega. */
export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const orderStatusValidator = v.union(
  v.literal(ORDER_STATUS.PENDING),
  v.literal(ORDER_STATUS.PAID),
  v.literal(ORDER_STATUS.SHIPPED),
  v.literal(ORDER_STATUS.DELIVERED),
  v.literal(ORDER_STATUS.CANCELLED),
);
export type OrderStatus = Infer<typeof orderStatusValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /** Produtos do catálogo — semeados da Fake Store API ou criados por usuários. */
    products: defineTable({
      title: v.string(),
      description: v.string(),
      price: v.number(),
      category: v.string(),
      image: v.string(), // URL externa ou storageId do Convex Storage
      rating: v.object({
        rate: v.number(),
        count: v.number(),
      }),
      sellerId: v.optional(v.id("users")), // undefined = anúncio semeador da API
      stock: v.number(),
      status: v.union(v.literal("active"), v.literal("inactive")),
      // Preço antigo (para exibir desconto riscado) — opcional.
      oldPrice: v.optional(v.number()),
      // Selos de vitrine: "Novo", "Oferta", "Esgotando" — opcional.
      tags: v.optional(v.array(v.string())),
    })
      .index("by_seller", ["sellerId"])
      .index("by_category", ["category"]),

    /** Avaliações e comentários dos clientes nos produtos. */
    reviews: defineTable({
      productId: v.id("products"),
      userId: v.id("users"),
      authorName: v.string(),
      rating: v.number(), // 1 a 5
      comment: v.string(),
    })
      .index("by_product", ["productId"])
      .index("by_user", ["userId"]),

    /** Conteúdo institucional editável (ex.: hero da página inicial). */
    settings: defineTable({
      key: v.string(),
      value: v.string(), // JSON serializado
    }).index("by_key", ["key"]),

    /** Central de notificações in-app dos usuários. */
    notifications: defineTable({
      userId: v.id("users"),
      type: v.string(), // "order", "product", "system"
      title: v.string(),
      body: v.string(),
      read: v.boolean(),
      link: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_read", ["userId", "read"]),

    /** Pedidos realizados pelos clientes. */
    orders: defineTable({
      userId: v.id("users"),
      customerName: v.string(),
      items: v.array(
        v.object({
          productId: v.string(),
          title: v.string(),
          price: v.number(),
          quantity: v.number(),
          image: v.string(),
        }),
      ),
      total: v.number(),
      status: orderStatusValidator,
      paymentMethod: v.string(),
      address: v.object({
        street: v.string(),
        number: v.string(),
        complement: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        zip: v.string(),
      }),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;

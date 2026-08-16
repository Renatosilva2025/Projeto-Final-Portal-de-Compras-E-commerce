import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser, isAdminUser } from "./users";
import { notify, notifyAdmins } from "./notifications";
import { orderStatusValidator } from "./schema";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

/** Item do pedido (snapshot do produto no momento da compra). */
const orderItemValidator = v.object({
  productId: v.string(),
  title: v.string(),
  price: v.number(),
  quantity: v.number(),
  image: v.string(),
});

const addressValidator = v.object({
  street: v.string(),
  number: v.string(),
  complement: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  zip: v.string(),
});

/** Finaliza a compra do carrinho, gerando um pedido pendente de pagamento. */
export const create = mutation({
  args: {
    items: v.array(orderItemValidator),
    customerName: v.string(),
    paymentMethod: v.string(),
    address: addressValidator,
  },
  handler: async (ctx, { items, customerName, paymentMethod, address }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado para finalizar a compra.");

    if (items.length === 0) throw new Error("Seu carrinho está vazio.");
    if (!customerName.trim()) throw new Error("Informe o seu nome.");
    if (!address.street.trim() || !address.city.trim() || !address.state.trim()) {
      throw new Error("Preencha os dados de entrega.");
    }

    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // Abate o estoque dos produtos comprados.
    for (const item of items) {
      try {
        const product = await ctx.db.get(item.productId as Id<"products">);
        if (product) {
          await ctx.db.patch(product._id, {
            stock: Math.max(0, product.stock - item.quantity),
          });
        }
      } catch {
        // produto pode ter sido removido; segue com o pedido
      }
    }

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      customerName: customerName.trim().slice(0, 120),
      items,
      total,
      status: "pending",
      paymentMethod,
      address,
    });

    // Avisa os administradores sobre o novo pedido.
    await notifyAdmins(ctx, {
      type: "order",
      title: "Novo pedido recebido",
      body: `${items.length} ${items.length === 1 ? "item" : "itens"} · R$ ${total.toFixed(2).replace(".", ",")} — ${customerName.trim()}`,
      link: "/admin?aba=pedidos",
    });

    return { orderId };
  },
});

/** Pedidos do usuário logado, do mais recente para o mais antigo. */
export const myOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const orders = await ctx.db.query("orders").collect();
    return orders
      .filter((o) => o.userId === user._id)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Detalhe de um pedido (dono ou administrador). */
export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const order = await ctx.db.get(id);
    if (!order) return null;
    if (order.userId !== user._id && !isAdminUser(user)) return null;

    return order;
  },
});

/** Todos os pedidos (apenas administradores). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) throw new Error("Acesso restrito a administradores.");

    const orders = await ctx.db.query("orders").collect();
    return orders.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Atualiza a situação de um pedido (apenas administradores). */
export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatusValidator },
  handler: async (ctx, { id, status }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) throw new Error("Acesso restrito a administradores.");

    const order = await ctx.db.get(id);
    if (!order) throw new Error("Pedido não encontrado.");

    await ctx.db.patch(id, { status });

    // Avisa o cliente sobre a nova situação do pedido.
    await notify(ctx, [order.userId], {
      type: "order",
      title: "Pedido atualizado",
      body: `Seu pedido #${id.slice(-8).toUpperCase()} agora está ${STATUS_LABELS[status] ?? status}.`,
      link: `/pedido/${id}`,
    });
  },
});

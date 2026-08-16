import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

interface NotificationData {
  type: string;
  title: string;
  body: string;
  link?: string;
}

/** Insere uma notificação para cada destinatário. */
export async function notify(
  ctx: MutationCtx,
  recipients: Id<"users">[],
  data: NotificationData,
) {
  for (const userId of recipients) {
    await ctx.db.insert("notifications", {
      userId,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link,
      read: false,
    });
  }
}

/** Notifica todos os administradores do portal. */
export async function notifyAdmins(ctx: MutationCtx, data: NotificationData) {
  const admins = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("role"), "admin"))
    .collect();
  await notify(
    ctx,
    admins.map((u) => u._id),
    data,
  );
}

/** Notificações do usuário logado, da mais recente para a mais antiga. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return notifications.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Marca uma notificação como lida. */
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;
    const notification = await ctx.db.get(id);
    if (!notification || notification.userId !== user._id) return;
    await ctx.db.patch(id, { read: true });
  },
});

/** Marca todas as notificações do usuário como lidas. */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const n of notifications) {
      if (!n.read) await ctx.db.patch(n._id, { read: true });
    }
  },
});

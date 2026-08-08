import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { roleValidator } from "./schema";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

/** O usuário é administrador? */
export const isAdminUser = (user: { role?: string | undefined } | null) =>
  user?.role === "admin";

/**
 * Primeiro usuário vira administrador automaticamente, para que o projeto
 * tenha alguém com acesso ao painel de gestão desde o início.
 */
export const bootstrapAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role === "admin") return;

    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .take(1);

    if (admins.length === 0) {
      await ctx.db.patch(user._id, { role: "admin" });
    }
  },
});

/** Atualiza o nome de exibição do usuário. */
export const updateProfile = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado.");

    const clean = name.trim().slice(0, 80);
    if (!clean) throw new Error("Informe um nome válido.");

    await ctx.db.patch(user._id, { name: clean });
  },
});

/** Lista todos os usuários (apenas administradores). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) throw new Error("Acesso restrito a administradores.");

    const users = await ctx.db.query("users").collect();
    return users.sort(
      (a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0),
    );
  },
});

/** Altera o papel de um usuário (apenas administradores). */
export const setRole = mutation({
  args: { userId: v.id("users"), role: roleValidator },
  handler: async (ctx, { userId, role }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) throw new Error("Acesso restrito a administradores.");

    await ctx.db.patch(userId, { role });
  },
});

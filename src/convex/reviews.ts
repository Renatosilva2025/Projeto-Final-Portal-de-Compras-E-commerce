import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdminUser } from "./users";

/** Avaliações de um produto, da mais recente para a mais antiga. */
export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, { productId }) => {
    const reviews = await ctx.db.query("reviews").collect();
    return reviews
      .filter((r) => r.productId === productId)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** Adiciona uma avaliação/comentário e atualiza a nota média do produto. */
export const addReview = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, { productId, rating, comment }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado para avaliar.");

    if (rating < 1 || rating > 5) throw new Error("A nota deve ser entre 1 e 5.");
    const text = comment.trim().slice(0, 1000);
    if (!text) throw new Error("Escreva um comentário antes de enviar.");

    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Produto não encontrado.");

    const authorName =
      user.name?.trim() ||
      user.email?.split("@")[0] ||
      "Cliente do portal";

    await ctx.db.insert("reviews", {
      productId,
      userId: user._id,
      authorName,
      rating,
      comment: text,
    });

    // Atualiza a média ponderada do produto.
    const { rate, count } = product.rating;
    const newCount = count + 1;
    const newRate = (rate * count + rating) / newCount;

    await ctx.db.patch(productId, {
      rating: { rate: Math.round(newRate * 10) / 10, count: newCount },
    });
  },
});

/** Remove uma avaliação (autor ou administrador). */
export const removeReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Você precisa estar conectado.");

    const review = await ctx.db.get(id);
    if (!review) throw new Error("Avaliação não encontrada.");
    if (review.userId !== user._id && !isAdminUser(user)) {
      throw new Error("Você não tem permissão para remover esta avaliação.");
    }

    await ctx.db.delete(id);
  },
});

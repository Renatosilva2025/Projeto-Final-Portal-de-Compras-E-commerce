import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdminUser } from "./users";

const HERO_KEY = "hero";

/** Conteúdo institucional da página inicial, editável pelo administrador. */
export interface HeroContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
}

const DEFAULT_HERO: HeroContent = {
  heroBadge: "Portal de Compras PD · Projeto final",
  heroTitle: "Eletrônicos e acessórios, em um só lugar.",
  heroDescription:
    "Capas de celular, carregadores, notebooks, fones e muito mais — compre como em um marketplace, anuncie seus produtos e avalie o que comprou.",
};

/** Lê o hero institucional; retorna os padrões quando ainda não foi editado. */
export const getHero = query({
  args: {},
  handler: async (ctx): Promise<HeroContent> => {
    const doc = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), HERO_KEY))
      .first();
    if (!doc) return DEFAULT_HERO;
    try {
      const parsed = JSON.parse(doc.value) as Partial<HeroContent>;
      return { ...DEFAULT_HERO, ...parsed };
    } catch {
      return DEFAULT_HERO;
    }
  },
});

/** Salva o hero institucional (apenas administradores). */
export const updateHero = mutation({
  args: {
    heroBadge: v.string(),
    heroTitle: v.string(),
    heroDescription: v.string(),
  },
  handler: async (ctx, { heroBadge, heroTitle, heroDescription }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Acesso restrito a administradores.");
    }

    const value = JSON.stringify({
      heroBadge: heroBadge.trim().slice(0, 80),
      heroTitle: heroTitle.trim().slice(0, 120),
      heroDescription: heroDescription.trim().slice(0, 500),
    } satisfies HeroContent);

    const doc = await ctx.db
      .query("settings")
      .filter((q) => q.eq(q.field("key"), HERO_KEY))
      .first();

    if (doc) {
      await ctx.db.patch(doc._id, { value });
    } else {
      await ctx.db.insert("settings", { key: HERO_KEY, value });
    }
  },
});

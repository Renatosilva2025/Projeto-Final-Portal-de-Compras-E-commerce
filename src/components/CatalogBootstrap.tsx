import { useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Semeia o catálogo (Fake Store API + anúncios curados) na primeira
 * visita, quando o banco ainda não possui nenhum produto.
 */
export function CatalogBootstrap() {
  const count = useQuery(api.products.count);
  const seed = useAction(api.products.seed);
  const ran = useRef(false);

  useEffect(() => {
    if (count === 0 && !ran.current) {
      ran.current = true;
      seed().catch((err) =>
        console.error("Não foi possível semear o catálogo:", err),
      );
    }
  }, [count, seed]);

  return null;
}

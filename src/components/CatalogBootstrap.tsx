import { useEffect, useRef } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Semeia o catálogo (Fake Store API + anúncios curados) na primeira
 * visita, quando o banco ainda não possui nenhum produto. Quando o
 * catálogo já existe, aplica a correção idempotente das imagens dos
 * anúncios curados (placeholders antigos → fotos reais).
 */
export function CatalogBootstrap() {
  const count = useQuery(api.products.count);
  const seed = useAction(api.products.seed);
  const fixImages = useMutation(api.products.fixCatalogImages);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || count === undefined) return;
    ran.current = true;
    if (count === 0) {
      seed().catch((err) =>
        console.error("Não foi possível semear o catálogo:", err),
      );
    } else {
      fixImages().catch((err) =>
        console.error("Não foi possível corrigir as imagens do catálogo:", err),
      );
    }
  }, [count, seed, fixImages]);

  return null;
}

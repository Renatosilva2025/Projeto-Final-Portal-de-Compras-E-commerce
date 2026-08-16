import { ChevronDown, LayoutGrid, Tag } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_ICONS } from "@/components/store/category-icons";
import { categoryLabel } from "@/types/product";

/** Descrições curtas das categorias para o mega menu (gatilho de descoberta). */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Acessórios para celular": "Capas, películas e proteções",
  "Carregadores e cabos": "Carregamento rápido e cabos",
  "Notebooks e computadores": "Portáteis e computadores",
  "Áudio e fones de ouvido": "Fones, caixas e headsets",
  "Smartphones e tablets": "Celulares e tablets",
  "Eletrônicos e gadgets": "Dispositivos e gadgets",
  "Moda e acessórios": "Roupas, joias e acessórios",
  "Casa e decoração": "Utilidades para o lar",
};

/**
 * Mega menu de categorias (estilo marketplace) para o cabeçalho desktop.
 * Lista as categorias reais do catálogo (Convex) com ícones e descrições,
 * levando o usuário direto ao catálogo filtrado (?categoria=…).
 */
export function MegaMenu() {
  const categories = useQuery(api.products.categories);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="rounded-full text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LayoutGrid className="size-4" />
          Categorias
          <ChevronDown className="size-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[min(680px,calc(100vw-2rem))] p-2"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navegar por categoria
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {categories === undefined ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Tag;
              return (
                <DropdownMenuItem
                  key={cat}
                  asChild
                  className="cursor-pointer rounded-lg"
                >
                  <Link
                    to={`/?categoria=${encodeURIComponent(cat)}`}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {categoryLabel(cat)}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {CATEGORY_DESCRIPTIONS[cat] ??
                          "Produtos desta categoria"}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="flex gap-2 p-1">
          <DropdownMenuItem asChild className="flex-1 cursor-pointer">
            <Link to="/" className="justify-center rounded-lg text-sm">
              <LayoutGrid className="size-4" />
              Ver catálogo completo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="flex-1 cursor-pointer">
            <Link
              to="/anunciar"
              className="justify-center rounded-lg text-sm text-primary"
            >
              <Tag className="size-4" />
              Anunciar produto
            </Link>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

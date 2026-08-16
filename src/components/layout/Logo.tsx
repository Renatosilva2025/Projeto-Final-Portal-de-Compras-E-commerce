import { ShoppingBag } from "lucide-react";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

/** Logotipo do Portal de Compras PD. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Portal de Compras PD — Página inicial"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-[-4deg]">
        <ShoppingBag className="size-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-xl font-bold tracking-tight">
          Portal de Compras
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          PD · Eletrônicos e acessórios
        </span>
      </span>
    </Link>
  );
}

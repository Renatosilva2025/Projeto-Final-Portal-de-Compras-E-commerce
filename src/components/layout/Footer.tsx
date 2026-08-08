import { Heart } from "lucide-react";
import { Link } from "react-router";
import { categoryLabel } from "@/types/product";
import { Logo } from "./Logo";

const FOOTER_CATEGORIES = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const FOOTER_LINKS = [
  { to: "/", label: "Início" },
  { to: "/carrinho", label: "Carrinho" },
  { to: "/favoritos", label: "Favoritos" },
];

/** Rodapé da loja com links de navegação e créditos. */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Vitrine é um portal de compras completo que simula um e-commerce
            real, alimentado pela Fake Store API.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Navegação
          </h3>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Categorias
          </h3>
          <ul className="space-y-2">
            {FOOTER_CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link
                  to={`/?categoria=${encodeURIComponent(cat)}`}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {categoryLabel(cat)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Sobre o projeto
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Projeto final acadêmico desenvolvido com React, Vite, React Router
            e gerenciamento de estado via Context API.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Dados fornecidos pela{" "}
            <a
              href="https://fakestoreapi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-primary"
            >
              Fake Store API
            </a>
            .
          </p>
        </div>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto flex w-full max-w-7xl items-center justify-center gap-1.5 px-4 py-4 text-center text-xs text-muted-foreground sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Vitrine — Portal de Compras</span>
          <span className="hidden items-center gap-1 sm:flex">
            Feito com <Heart className="size-3.5 fill-red-500 text-red-500" />{" "}
            em React
          </span>
        </p>
      </div>
    </footer>
  );
}

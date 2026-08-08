import { Heart } from "lucide-react";
import { Link } from "react-router";
import { Logo } from "./Logo";

const FOOTER_CATEGORIES = [
  "Acessórios para celular",
  "Carregadores e cabos",
  "Notebooks e computadores",
  "Áudio e fones de ouvido",
  "Smartphones e tablets",
];

const FOOTER_LINKS = [
  { to: "/", label: "Início" },
  { to: "/carrinho", label: "Carrinho" },
  { to: "/favoritos", label: "Favoritos" },
  { to: "/conta", label: "Minha conta" },
  { to: "/anunciar", label: "Anunciar produto" },
];

/** Rodapé do Portal de Compras PD com navegação, categorias e créditos. */
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-muted/40">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            O Portal de Compras PD é um marketplace completo de eletrônicos e
            acessórios: compre, venda, avalie e acompanhe seus pedidos em um
            só lugar.
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
                  {cat}
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
            e Convex — com catálogo, carrinho, checkout, avaliações e painel
            administrativo.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Catálogo semeador da{" "}
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
          <span>
            © {new Date().getFullYear()} Portal de Compras PD
          </span>
          <span className="hidden items-center gap-1 sm:flex">
            Feito com <Heart className="size-3.5 fill-red-500 text-red-500" />{" "}
            em React + Convex
          </span>
        </p>
      </div>
    </footer>
  );
}

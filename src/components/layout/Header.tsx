import { AnimatePresence, motion } from "framer-motion";
import { Heart, Moon, ShoppingBag, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, NavLink } from "react-router";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/store/SearchBar";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/favoritos", label: "Favoritos", end: false },
];

/** Cabeçalho fixo com busca, alternador de tema e botão do carrinho. */
export function Header() {
  const { count, openCart } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <SearchBar className="hidden w-56 lg:block xl:w-72" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={
                isDark ? "Ativar tema claro" : "Ativar tema escuro"
              }
              className="rounded-full text-muted-foreground"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "sun" : "moon"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  {isDark ? (
                    <Sun className="size-5" />
                  ) : (
                    <Moon className="size-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Ver favoritos"
              className="rounded-full text-muted-foreground md:hidden"
            >
              <Link to="/favoritos">
                <Heart className="size-5" />
              </Link>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={openCart}
              aria-label="Abrir carrinho de compras"
              className="relative rounded-full"
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow"
                >
                  {count > 99 ? "99+" : count}
                </motion.span>
              )}
            </Button>
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}

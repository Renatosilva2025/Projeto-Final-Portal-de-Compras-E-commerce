import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePlus,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  ShoppingBag,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link, NavLink, useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "@/components/store/SearchBar";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { to: "/", label: "Início", end: true },
  { to: "/favoritos", label: "Favoritos", end: false },
];

function userInitials(name?: string, email?: string) {
  const source = name || email || "U";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "U";
}

/** Cabeçalho fixo com busca, menu de conta, alternador de tema e carrinho. */
export function Header() {
  const { count, openCart } = useCart();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const isDark = resolvedTheme === "dark";
  const isAdmin = user?.role === "admin";

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

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
            {isAuthenticated && (
              <NavLink
                to="/conta"
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                Minha conta
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <SearchBar className="hidden w-56 lg:block xl:w-72" />

            {isAuthenticated && (
              <Button
                asChild
                variant="outline"
                className="hidden rounded-full md:inline-flex"
              >
                <Link to="/anunciar">
                  <BadgePlus className="size-4" />
                  Anunciar
                </Link>
              </Button>
            )}

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

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground"
                    aria-label="Abrir menu da conta"
                  >
                    <Avatar className="size-8 border border-border/70">
                      {user?.image ? (
                        <AvatarImage src={user.image} alt={user.name ?? ""} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                          {userInitials(user?.name, user?.email)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="truncate font-semibold">
                      {user?.name || "Minha conta"}
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/conta">
                      <LayoutDashboard className="mr-2 size-4" />
                      Minha conta
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/anunciar">
                      <BadgePlus className="mr-2 size-4" />
                      Anunciar produto
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 size-4" />
                        Painel administrativo
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sair da conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">
                  <UserRound className="size-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pb-3 lg:hidden">
          <SearchBar className="flex-1" />
          {isAuthenticated && (
            <Button asChild variant="outline" size="icon" className="shrink-0 rounded-full">
              <Link to="/anunciar" aria-label="Anunciar produto">
                <BadgePlus className="size-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

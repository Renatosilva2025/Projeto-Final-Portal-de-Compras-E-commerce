import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BadgePlus,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  PencilLine,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/store/EmptyState";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import { ProductImage } from "@/components/store/ProductImage";
import { useFavorites } from "@/context/favorites-context";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatPrice } from "@/lib/format";

function Account() {
  const { user, signOut } = useAuth();
  const { favoriteIds } = useFavorites();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("aba") ?? "resumo";

  const myOrders = useQuery(api.orders.myOrders);
  const myProducts = useQuery(api.products.myProducts);

  const toggleStatus = useMutation(api.products.toggleStatus);
  const removeProduct = useMutation(api.products.remove);
  const updateProfile = useMutation(api.users.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleSaveName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingName(true);
    try {
      await updateProfile({ name });
      toast.success("Nome atualizado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSavingName(false);
    }
  };

  const handleToggle = async (id: Id<"products">) => {
    try {
      await toggleStatus({ id });
      toast.success("Situação do anúncio atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar.");
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    try {
      await removeProduct({ id });
      toast.success("Anúncio removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  const setTab = (tab: string) => setSearchParams({ aba: tab });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-bold sm:text-4xl">
            <LayoutDashboard className="size-7 text-primary" />
            Minha conta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.name || "Olá"} · {user?.email}
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3" />
                Administrador
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/anunciar">
              <BadgePlus className="size-4" />
              Anunciar produto
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild className="rounded-full">
              <Link to="/admin">
                <ShieldCheck className="size-4" />
                Painel administrativo
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setTab} className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto rounded-full sm:w-auto">
          <TabsTrigger value="resumo" className="rounded-full">
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="rounded-full">
            Meus pedidos
          </TabsTrigger>
          <TabsTrigger value="anuncios" className="rounded-full">
            Meus anúncios
          </TabsTrigger>
          <TabsTrigger value="perfil" className="rounded-full">
            Perfil
          </TabsTrigger>
        </TabsList>

        {/* ── Visão geral ─────────────────────────────────────── */}
        <TabsContent value="resumo" className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={ShoppingBag}
              label="Pedidos realizados"
              value={myOrders?.length}
              onClick={() => setTab("pedidos")}
            />
            <StatCard
              icon={Heart}
              label="Favoritos"
              value={favoriteIds.length}
              onClick={() => navigate("/favoritos")}
            />
            <StatCard
              icon={Store}
              label="Anúncios ativos"
              value={
                myProducts?.filter((p) => p.status === "active").length
              }
              onClick={() => setTab("anuncios")}
            />
          </div>

          <section className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-serif text-lg font-bold">Pedidos recentes</h2>
              <Button
                variant="ghost"
                className="rounded-full text-muted-foreground"
                onClick={() => setTab("pedidos")}
              >
                Ver todos
              </Button>
            </div>
            {myOrders === undefined ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : myOrders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Você ainda não fez nenhum pedido.{" "}
                <Link to="/" className="font-medium text-primary hover:underline">
                  Explore o catálogo
                </Link>{" "}
                e faça sua primeira compra!
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {myOrders.slice(0, 3).map((order) => (
                  <li key={order._id}>
                    <Link
                      to={`/pedido/${order._id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/40"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">
                          #{order._id.slice(-10).toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "itens"} ·{" "}
                          {formatDate(order._creationTime)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold tabular-nums">
                          {formatPrice(order.total)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* ── Pedidos ─────────────────────────────────────────── */}
        <TabsContent value="pedidos" className="mt-6">
          {myOrders === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : myOrders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Nenhum pedido ainda"
              description="Quando você finalizar uma compra, seus pedidos aparecerão aqui."
              actionLabel="Explorar produtos"
              onAction={() => navigate("/")}
            />
          ) : (
            <ul className="space-y-4">
              {myOrders.map((order) => (
                <li
                  key={order._id}
                  className="rounded-2xl border border-border/70 bg-card p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-muted-foreground">
                        #{order._id.slice(-10).toUpperCase()} ·{" "}
                        {formatDate(order._creationTime)}
                      </p>
                      <p className="mt-1 text-sm">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "itens"} ·{" "}
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link to={`/pedido/${order._id}`}>Detalhes</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3 overflow-x-auto">
                    {order.items.slice(0, 4).map((item) => (
                      <ProductImage
                        key={item.productId}
                        src={item.image}
                        alt={item.title}
                        className="size-14 shrink-0 rounded-lg"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ── Anúncios ────────────────────────────────────────── */}
        <TabsContent value="anuncios" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Button asChild className="rounded-full">
              <Link to="/anunciar">
                <BadgePlus className="size-4" />
                Criar anúncio
              </Link>
            </Button>
          </div>
          {myProducts === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : myProducts.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Você ainda não anunciou nada"
              description="Cadastre seus produtos para vender no portal — é rápido e gratuito."
              actionLabel="Criar meu primeiro anúncio"
              onAction={() => navigate("/anunciar")}
            />
          ) : (
            <ul className="space-y-4">
              {myProducts.map((product) => (
                <li
                  key={product._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
                >
                  <Link to={`/produto/${product._id}`} className="shrink-0">
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      className="size-20 rounded-xl"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/produto/${product._id}`}
                      className="line-clamp-1 text-sm font-medium hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatPrice(product.price)} · estoque {product.stock} ·{" "}
                      {formatDate(product._creationTime)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={
                          product.status === "active"
                            ? "text-xs font-semibold text-emerald-600"
                            : "text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {product.status === "active" ? "Ativo" : "Pausado"}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {product.rating.count}{" "}
                        {product.rating.count === 1 ? "avaliação" : "avaliações"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      aria-label="Editar anúncio"
                      className="rounded-full"
                    >
                      <Link to={`/anunciar?editar=${product._id}`}>
                        <PencilLine className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => handleToggle(product._id)}
                    >
                      {product.status === "active" ? "Pausar" : "Reativar"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remover anúncio"
                          className="rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover anúncio?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O anúncio será
                            removido do catálogo permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(product._id)}
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ── Perfil ──────────────────────────────────────────── */}
        <TabsContent value="perfil" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Dados pessoais</h2>
              <form onSubmit={handleSaveName} className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="profile-name">Nome de exibição</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como você quer aparecer nas avaliações"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-email">E-mail</Label>
                  <Input
                    id="profile-email"
                    value={user?.email ?? ""}
                    readOnly
                    className="mt-1.5 bg-muted/50"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    O e-mail é usado para login e não pode ser alterado.
                  </p>
                </div>
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={savingName}
                >
                  {savingName && <Loader2 className="size-4 animate-spin" />}
                  Salvar alterações
                </Button>
              </form>
            </section>

            <section className="h-fit rounded-2xl border border-border/70 bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Sessão</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Encerre sua sessão neste navegador quando terminar de usar o
                portal.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2 rounded-full text-destructive hover:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Sair da conta
              </Button>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-border/70 bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 font-serif text-3xl font-bold tabular-nums">
        {value ?? <Skeleton className="h-8 w-10" />}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </button>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <StoreLayout>
        <Account />
      </StoreLayout>
    </RequireAuth>
  );
}

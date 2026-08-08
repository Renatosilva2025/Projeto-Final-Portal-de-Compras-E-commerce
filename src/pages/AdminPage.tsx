import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Banknote,
  Eye,
  PencilLine,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  Users,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import { ProductImage } from "@/components/store/ProductImage";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_ORDER, type Order } from "@/types/product";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  user: "Usuário",
  member: "Membro",
};

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("aba") ?? "resumo";

  const products = useQuery(api.products.listAllProducts);
  const orders = useQuery(api.orders.listAll);
  const users = useQuery(api.users.listAll);

  const toggleStatus = useMutation(api.products.toggleStatus);
  const removeProduct = useMutation(api.products.remove);
  const updateStatus = useMutation(api.orders.updateStatus);
  const setRole = useMutation(api.users.setRole);

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const setTab = (tab: string) => setSearchParams({ aba: tab });

  if (user !== undefined && user?.role !== "admin") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldCheck className="size-8" />
        </span>
        <h1 className="mt-4 font-serif text-3xl font-bold">
          Acesso restrito
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas administradores podem acessar o painel de gestão do portal.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/conta">Voltar para minha conta</Link>
        </Button>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Skeleton className="h-24 w-96 rounded-2xl" />
      </div>
    );
  }

  const revenue = (orders ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);

  const handleToggle = async (id: Id<"products">) => {
    try {
      await toggleStatus({ id });
      toast.success("Situação do anúncio atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível alterar.");
    }
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await removeProduct({ id: pendingDelete as Id<"products"> });
      toast.success("Anúncio removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível remover.");
    } finally {
      setPendingDelete(null);
    }
  };

  const handleOrderStatus = async (id: Id<"orders">, status: Order["status"]) => {
    try {
      await updateStatus({ id, status });
      toast.success("Situação do pedido atualizada.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  const handleRole = async (userId: Id<"users">, role: string) => {
    try {
      await setRole({ userId, role: role as "admin" | "user" | "member" });
      toast.success("Papel do usuário atualizado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível atualizar.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2.5 font-serif text-3xl font-bold sm:text-4xl">
          <ShieldCheck className="size-7 text-primary" />
          Painel administrativo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o catálogo, os pedidos e os usuários do Portal de Compras PD.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setTab} className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto rounded-full sm:w-auto">
          <TabsTrigger value="resumo" className="rounded-full">
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="produtos" className="rounded-full">
            Produtos
          </TabsTrigger>
          <TabsTrigger value="pedidos" className="rounded-full">
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="rounded-full">
            Usuários
          </TabsTrigger>
        </TabsList>

        {/* ── Visão geral ─────────────────────────────────────── */}
        <TabsContent value="resumo" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStat
              icon={Store}
              label="Anúncios no catálogo"
              value={products?.length}
            />
            <AdminStat
              icon={ShoppingBag}
              label="Pedidos"
              value={orders?.length}
            />
            <AdminStat
              icon={Users}
              label="Usuários cadastrados"
              value={users?.length}
            />
            <AdminStat
              icon={Banknote}
              label="Receita (excl. cancelados)"
              value={revenue}
              currency
            />
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Use as abas acima para gerenciar produtos, acompanhar pedidos e
            definir papéis dos usuários.
          </p>
        </TabsContent>

        {/* ── Produtos ────────────────────────────────────────── */}
        <TabsContent value="produtos" className="mt-6">
          <div className="mb-4 flex justify-end">
            <Button asChild className="rounded-full">
              <Link to="/anunciar">Criar anúncio</Link>
            </Button>
          </div>
          {products === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li
                  key={product._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className="size-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {product.category} · {formatPrice(product.price)} ·{" "}
                      estoque {product.stock} ·{" "}
                      {product.sellerId ? "Anúncio de usuário" : "Catálogo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        product.status === "active"
                          ? "text-xs font-semibold text-emerald-600"
                          : "text-xs font-semibold text-muted-foreground"
                      }
                    >
                      {product.status === "active" ? "Ativo" : "Pausado"}
                    </span>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label="Ver anúncio"
                      className="rounded-full text-muted-foreground"
                    >
                      <Link to={`/produto/${product._id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      aria-label="Editar anúncio"
                      className="rounded-full text-muted-foreground"
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
                    <AlertDialog
                      open={pendingDelete === product._id}
                      onOpenChange={(open) =>
                        setPendingDelete(open ? product._id : null)
                      }
                    >
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
                            O anúncio será removido do catálogo
                            permanentemente. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDelete}
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

        {/* ── Pedidos ─────────────────────────────────────────── */}
        <TabsContent value="pedidos" className="mt-6">
          {orders === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ) : orders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              Nenhum pedido foi realizado ainda.
            </p>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-muted-foreground">
                      #{order._id.slice(-10).toUpperCase()} ·{" "}
                      {order.customerName} · {formatDate(order._creationTime)}
                    </p>
                    <p className="mt-1 text-sm">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "itens"} ·{" "}
                      <span className="font-semibold tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <Select
                      value={order.status}
                      onValueChange={(value) =>
                        handleOrderStatus(order._id, value as Order["status"])
                      }
                    >
                      <SelectTrigger className="w-36 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_ORDER.map((status) => (
                          <SelectItem key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* ── Usuários ────────────────────────────────────────── */}
        <TabsContent value="usuarios" className="mt-6">
          {users === undefined ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((u) => (
                <li
                  key={u._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {(u.name || u.email || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {u.name || "Sem nome"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email ?? "Sem e-mail"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Cadastrado em {formatDate(u._creationTime)}
                    </span>
                    <Select
                      value={u.role ?? "user"}
                      onValueChange={(value) => handleRole(u._id, value)}
                    >
                      <SelectTrigger className="w-40 rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-10">
        <Button
          variant="ghost"
          className="rounded-full text-muted-foreground"
          onClick={() => navigate("/conta")}
        >
          ← Voltar para minha conta
        </Button>
      </div>
    </div>
  );
}

function AdminStat({
  icon: Icon,
  label,
  value,
  currency,
}: {
  icon: typeof Store;
  label: string;
  value: number | undefined;
  currency?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <p className="mt-3 font-serif text-3xl font-bold tabular-nums">
        {value === undefined ? (
          <Skeleton className="h-8 w-14" />
        ) : currency ? (
          formatPrice(value)
        ) : (
          value
        )}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth>
      <StoreLayout>
        <AdminPanel />
      </StoreLayout>
    </RequireAuth>
  );
}

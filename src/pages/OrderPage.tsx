import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CheckCircle2,
  CreditCard,
  MapPin,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { OrderStatusBadge } from "@/components/store/OrderStatusBadge";
import { ProductImage } from "@/components/store/ProductImage";
import { formatDate, formatPrice } from "@/lib/format";
import { PAYMENT_METHODS } from "@/types/product";

function paymentLabel(value: string) {
  return (
    PAYMENT_METHODS.find((m) => m.value === value)?.label ??
    value ?? "Pagamento"
  );
}

function OrderDetails() {
  const { id } = useParams();
  const orderId = id as Id<"orders">;
  const order = useQuery(api.orders.get, { id: orderId });

  if (order === undefined) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="font-serif text-3xl font-bold">Pedido não encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Este pedido não existe ou você não tem permissão para vê-lo.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Voltar à loja</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
          Pedido confirmado!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Obrigado pela sua compra, {order.customerName.split(" ")[0]}. Acompanhe
          o andamento do seu pedido em <strong>Minha conta</strong>.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Pedido
          </p>
          <p className="font-mono text-sm font-semibold">
            #{order._id.slice(-10).toUpperCase()}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Data
          </p>
          <p className="text-sm font-semibold">
            {formatDate(order._creationTime)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Situação
          </p>
          <OrderStatusBadge status={order.status} className="mt-1" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Total
          </p>
          <p className="font-serif text-lg font-bold text-primary">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border/70 bg-card p-6">
        <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
          <PackageCheck className="size-5 text-primary" />
          Itens do pedido
        </h2>
        <ul className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-4 py-3">
              <ProductImage
                src={item.image}
                alt={item.title}
                className="size-16 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
          <span className="font-semibold">Total</span>
          <span className="font-serif text-xl font-bold text-primary">
            {formatPrice(order.total)}
          </span>
        </div>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
            <MapPin className="size-5 text-primary" />
            Entrega
          </h2>
          <address className="mt-3 text-sm not-italic leading-6 text-muted-foreground">
            {order.customerName}
            <br />
            {order.address.street}
            {order.address.number ? `, ${order.address.number}` : ""}
            {order.address.complement ? ` — ${order.address.complement}` : ""}
            <br />
            {order.address.city} — {order.address.state}
            <br />
            CEP {order.address.zip}
          </address>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-6">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
            <CreditCard className="size-5 text-primary" />
            Pagamento
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {paymentLabel(order.paymentMethod)} ·{" "}
            {order.status === "pending" ? "aguardando confirmação" : "confirmado"}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground/80">
            Compra simulada — nenhum valor real foi cobrado.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" className="rounded-full">
          <Link to="/conta?aba=pedidos">
            <ShoppingBag className="size-4" />
            Meus pedidos
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <Link to="/">Continuar comprando</Link>
        </Button>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <RequireAuth>
      <StoreLayout>
        <OrderDetails />
      </StoreLayout>
    </RequireAuth>
  );
}

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreditCard, Loader2, MapPin, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/store/EmptyState";
import { ProductImage } from "@/components/store/ProductImage";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { PAYMENT_METHODS } from "@/types/product";

function Checkout() {
  const { items, subtotal, count, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrder = useMutation(api.orders.create);

  const [name, setName] = useState(user?.name ?? "");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [payment, setPayment] = useState<string>(PAYMENT_METHODS[0].value);
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho antes de finalizar a compra."
          actionLabel="Explorar produtos"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!street.trim() || !city.trim() || !state.trim() || !zip.trim()) {
      toast.error("Preencha os dados de entrega para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const { orderId } = await createOrder({
        items: items.map(({ product, quantity }) => ({
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity,
          image: product.image,
        })),
        customerName: name,
        paymentMethod: payment,
        address: {
          street,
          number,
          complement,
          city,
          state,
          zip,
        },
      });
      clearCart();
      toast.success("Pedido confirmado com sucesso!");
      navigate(`/pedido/${orderId}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível concluir o pedido.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold sm:text-4xl">Finalizar compra</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Revise os itens, informe o endereço de entrega e escolha o pagamento.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-8">
          {/* Itens */}
          <section className="rounded-2xl border border-border/70 bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <ShoppingCart className="size-5 text-primary" />
              Itens do pedido
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {count} {count === 1 ? "item" : "itens"}
              </span>
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {items.map(({ product, quantity }) => (
                <li key={product._id} className="flex items-center gap-4 py-3">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    className="size-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">
                      {product.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {quantity} × {formatPrice(product.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Entrega */}
          <section className="rounded-2xl border border-border/70 bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <MapPin className="size-5 text-primary" />
              Endereço de entrega
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street">Rua / Avenida</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Rua das Flores"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="complement">Complemento (opcional)</Label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apto, bloco…"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="zip">CEP</Label>
                <Input
                  id="zip"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="00000-000"
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="rounded-2xl border border-border/70 bg-card p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
              <CreditCard className="size-5 text-primary" />
              Forma de pagamento
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPayment(method.value)}
                  aria-pressed={payment === method.value}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all duration-200",
                    payment === method.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-semibold">
                    {method.label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {method.hint}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
              Esta é uma compra simulada para fins acadêmicos — nenhum
              pagamento real será realizado ou cobrado.
            </p>
          </section>
        </div>

        {/* Resumo */}
        <aside className="rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-serif text-xl font-bold">Resumo do pedido</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd className="font-medium text-emerald-600">Grátis</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold tabular-nums text-primary">
                {formatPrice(subtotal)}
              </dd>
            </div>
          </dl>

          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full rounded-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Confirmando…
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                Confirmar pedido
              </>
            )}
          </Button>
          <Button
            asChild
            variant="ghost"
            className="mt-2 w-full rounded-full text-muted-foreground"
          >
            <Link to="/carrinho">Voltar ao carrinho</Link>
          </Button>
        </aside>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <StoreLayout>
        <Checkout />
      </StoreLayout>
    </RequireAuth>
  );
}

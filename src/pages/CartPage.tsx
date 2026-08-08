import { useState } from "react";
import { CreditCard, ShoppingCart, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
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
import { StoreLayout } from "@/components/layout/StoreLayout";
import { EmptyState } from "@/components/store/EmptyState";
import { ProductImage } from "@/components/store/ProductImage";
import { QuantityStepper } from "@/components/store/QuantityStepper";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { categoryLabel } from "@/types/product";

/** Página do carrinho: quantidades, remoção e total em tempo real. */
export default function CartPage() {
  const { items, subtotal, count, setQuantity, removeItem, clearCart } =
    useCart();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCheckout = () => {
    clearCart();
    setConfirmOpen(false);
    toast.success("Pedido confirmado! Obrigado pela compra. 🎉");
    navigate("/");
  };

  return (
    <StoreLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">
          Carrinho de compras
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seus itens ficam salvos no navegador mesmo após recarregar a página.
        </p>

        {items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={ShoppingCart}
              title="Seu carrinho está vazio"
              description="Explore o catálogo e adicione os produtos que você gosta."
              actionLabel="Explorar produtos"
              onAction={() => navigate("/")}
            />
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
            {/* Lista de itens */}
            <ul className="space-y-4">
              {items.map(({ product, quantity }) => (
                <li
                  key={product.id}
                  className="flex flex-wrap gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-nowrap sm:items-center"
                >
                  <Link
                    to={`/produto/${product.id}`}
                    className="shrink-0"
                    aria-label={`Ver ${product.title}`}
                  >
                    <ProductImage
                      src={product.image}
                      alt={product.title}
                      className="size-24 rounded-xl sm:size-28"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/produto/${product.id}`}
                      className="line-clamp-2 font-medium leading-snug transition-colors hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                      {categoryLabel(product.category)}
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="text-muted-foreground">Unitário: </span>
                      <span className="font-semibold tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                    </p>
                  </div>

                  <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end">
                    <QuantityStepper
                      value={quantity}
                      onChange={(q) => setQuantity(product.id, q)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">
                        {formatPrice(product.price * quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(product.id)}
                        aria-label={`Remover ${product.title} do carrinho`}
                        className="rounded-full text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Resumo */}
            <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-serif text-xl font-bold">Resumo do pedido</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">
                    Subtotal ({count} {count === 1 ? "item" : "itens"})
                  </dt>
                  <dd className="font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </dd>
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

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="lg" className="mt-5 w-full rounded-full">
                    <CreditCard className="size-4" />
                    Finalizar compra
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar pedido?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a concluir um pedido de {count}{" "}
                      {count === 1 ? "item" : "itens"} no valor total de{" "}
                      <strong>{formatPrice(subtotal)}</strong>. Esta é uma
                      compra simulada — nenhum pagamento será realizado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCheckout}>
                      Confirmar pedido
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pagamento seguro · Compra simulada
              </p>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

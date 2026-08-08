import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { QuantityStepper } from "./QuantityStepper";

/** Drawer lateral do carrinho com resumo em tempo real. */
export function CartDrawer() {
  const { items, subtotal, count, isOpen, closeCart, removeItem, setQuantity } =
    useCart();

  // Trava o scroll do body enquanto o drawer está aberto.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-label="Carrinho de compras"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <ShoppingBag className="size-5 text-primary" />
                Seu carrinho
                {count > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {count} {count === 1 ? "item" : "itens"}
                  </span>
                )}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={closeCart}
                aria-label="Fechar carrinho"
                className="rounded-full text-muted-foreground"
              >
                <X className="size-5" />
              </Button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <ShoppingBag className="size-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Seu carrinho está vazio.
                </p>
                <Button onClick={closeCart} className="rounded-full">
                  Continuar comprando
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {items.map(({ product, quantity }) => (
                    <li
                      key={product._id}
                      className="flex gap-3 rounded-xl border border-border/70 p-3"
                    >
                      <Link
                        to={`/produto/${product._id}`}
                        onClick={closeCart}
                        className="shrink-0"
                      >
                        <ProductImage
                          src={product.image}
                          alt={product.title}
                          className="size-16 rounded-lg"
                        />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/produto/${product._id}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-xs font-medium leading-snug hover:text-primary"
                          >
                            {product.title}
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeItem(product._id)}
                            aria-label={`Remover ${product.title}`}
                            className="-mr-1 -mt-1 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <QuantityStepper
                            value={quantity}
                            onChange={(q) => setQuantity(product._id, q)}
                            className="scale-90 origin-left"
                          />
                          <span className="text-sm font-bold tabular-nums">
                            {formatPrice(product.price * quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="space-y-3 border-t border-border px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-lg font-bold tabular-nums">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Frete grátis em todas as compras.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 rounded-full"
                    >
                      <Link to="/carrinho" onClick={closeCart}>
                        Ver carrinho
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 rounded-full"
                    >
                      <Link to="/carrinho" onClick={closeCart}>
                        Finalizar compra
                      </Link>
                    </Button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

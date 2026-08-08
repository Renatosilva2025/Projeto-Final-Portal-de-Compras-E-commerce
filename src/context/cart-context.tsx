import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { CartItem, Product } from "@/types/product";

interface CartContextValue {
  items: CartItem[];
  /** Quantidade total de itens (soma das quantidades). */
  count: number;
  /** Soma dos preços × quantidades, atualizada em tempo real. */
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Gerenciamento de estado global do carrinho (Context API),
 * com persistência em localStorage.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>(
    "vitrine:carrinho",
    [],
  );
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: Math.min(99, item.quantity + quantity) }
              : item,
          );
        }
        return [...prev, { product, quantity }];
      });
      const shortTitle =
        product.title.length > 42
          ? `${product.title.slice(0, 42)}…`
          : product.title;
      toast.success(`${shortTitle} adicionado ao carrinho`);
      setIsOpen(true);
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: number) => {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      toast.info("Item removido do carrinho");
    },
    [setItems],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((item) => item.product.id !== productId)
          : prev.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: Math.min(99, quantity) }
                : item,
            ),
      );
    },
    [setItems],
  );

  const clearCart = useCallback(() => setItems([]), [setItems]);

  const count = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    }),
    [
      items,
      count,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return ctx;
}

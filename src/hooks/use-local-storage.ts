import { useEffect, useState } from "react";

/**
 * Estado React sincronizado com localStorage — usado para persistir
 * o carrinho e os favoritos mesmo após recarregar a página.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignora falhas de escrita (ex.: modo anônimo do navegador).
    }
  }, [key, value]);

  return [value, setValue] as const;
}

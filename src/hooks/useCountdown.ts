import { useEffect, useState } from "react";

export interface CountdownParts {
  hours: number;
  minutes: number;
  seconds: number;
  /** Milissegundos restantes no total (0 quando o alvo já passou). */
  total: number;
}

/**
 * Contagem regressiva até `target` (timestamp em ms), atualizada a cada
 * segundo. Quando o alvo muda, o contador reinicia no próximo tick.
 */
export function useCountdown(target: number): CountdownParts {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const total = Math.max(0, target - now);
  return {
    total,
    hours: Math.floor(total / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1000),
  };
}

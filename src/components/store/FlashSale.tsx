import { useMemo } from "react";
import { Link } from "react-router";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCountdown } from "@/hooks/useCountdown";
import { flashWindowEnd } from "@/lib/flash-sale";
import type { Product } from "@/types/product";
import { ProductCarousel } from "./ProductCarousel";

/** Caixa de um dígito do contador (horas/minutos/segundos). */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="min-w-9 rounded-lg bg-white/10 px-1.5 py-1 text-center font-mono text-base font-bold tabular-nums leading-none text-amber-400 sm:min-w-11 sm:px-2 sm:text-lg">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
    </div>
  );
}

/**
 * Vitrine de ofertas relâmpago: produtos com maior desconto em um painel
 * escuro de urgência, com contagem regressiva de 12h que reinicia sozinha.
 */
export function FlashSale({ products }: { products: Product[] }) {
  const end = useMemo(() => flashWindowEnd(), []);
  const { hours, minutes, seconds } = useCountdown(end);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-2 pt-10 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 px-5 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-orange-600/10 blur-3xl" />

        <ProductCarousel
          className="relative"
          products={products}
          title={
            <div>
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Zap className="size-5" />
                </span>
                <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  Ofertas relâmpago
                </h2>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 sm:text-sm">
                Descontos reais por tempo limitado — quando o cronômetro zerar,
                a próxima leva começa.
              </p>
              <Link
                to="/?ordem=discount-desc"
                className="mt-2 inline-block text-xs font-semibold text-amber-400 underline-offset-4 hover:underline sm:hidden"
              >
                Ver todas as ofertas
              </Link>
            </div>
          }
          action={
            <>
              <div
                className="flex items-start gap-2"
                aria-label="Tempo restante das ofertas relâmpago"
                role="timer"
              >
                <CountdownUnit value={hours} label="hrs" />
                <CountdownUnit value={minutes} label="min" />
                <CountdownUnit value={seconds} label="seg" />
              </div>
              <Button
                asChild
                variant="outline"
                className="hidden rounded-full border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white sm:inline-flex"
              >
                <Link to="/?ordem=discount-desc">Ver todas</Link>
              </Button>
            </>
          }
        />
      </div>
    </section>
  );
}

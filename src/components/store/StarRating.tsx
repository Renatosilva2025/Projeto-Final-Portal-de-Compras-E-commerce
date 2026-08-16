import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rate: number;
  count?: number;
  className?: string;
}

/** Avaliação em estrelas + nota numérica (e nº de avaliações quando informado). */
export function StarRating({ rate, count, className }: StarRatingProps) {
  const filled = Math.round(rate);

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      aria-label={`Avaliação ${rate} de 5`}
    >
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < filled
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums text-foreground">
        {rate.toFixed(1)}
      </span>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">
          ({count} avaliações)
        </span>
      )}
    </div>
  );
}

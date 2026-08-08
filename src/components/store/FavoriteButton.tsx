import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/favorites-context";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: number;
  className?: string;
  size?: "icon" | "icon-sm" | "icon-lg";
}

/** Botão de favoritar (coração) com feedback visual via toast. */
export function FavoriteButton({
  productId,
  className,
  size = "icon",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(productId);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      aria-label={
        active ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(productId);
        if (active) {
          toast.info("Removido dos favoritos");
        } else {
          toast.success("Adicionado aos favoritos");
        }
      }}
      className={cn("rounded-full", className)}
    >
      <Heart
        className={cn(
          "size-4 transition-all duration-200",
          active
            ? "scale-110 fill-red-500 text-red-500"
            : "text-muted-foreground hover:text-red-500",
        )}
      />
    </Button>
  );
}

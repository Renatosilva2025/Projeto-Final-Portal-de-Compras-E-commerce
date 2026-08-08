import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

/** Imagem de produto com fallback amigável caso o CDN da API falhe. */
export function ProductImage({
  src,
  alt,
  className,
  imgClassName,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-white",
        className,
      )}
    >
      {failed ? (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageOff className="size-8" />
          <span className="text-xs">Imagem indisponível</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imgClassName)}
        />
      )}
    </div>
  );
}

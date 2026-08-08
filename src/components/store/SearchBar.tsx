import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

/** Barra de busca com debounce — sincroniza com o parâmetro ?q= da URL. */
export function SearchBar({ className }: { className?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const debounced = useDebounce(input, 300);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const term = debounced.trim();
    if (isHome) {
      const params = new URLSearchParams(searchParams);
      if (term) {
        params.set("q", term);
      } else {
        params.delete("q");
      }
      setSearchParams(params, { replace: true });
    } else if (term) {
      // Busca iniciada fora da home: navega para o catálogo com o termo.
      navigate(`/?q=${encodeURIComponent(term)}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, isHome]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Buscar produtos…"
        aria-label="Buscar produtos"
        className="rounded-full bg-card pl-10 pr-10"
      />
      {input && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setInput("")}
          aria-label="Limpar busca"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

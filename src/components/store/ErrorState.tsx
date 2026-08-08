import { RefreshCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/** Estado de erro das requisições com botão de tentar novamente. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">Ops! Algo deu errado.</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {message}
        </p>
      </div>
      <Button
        variant="outline"
        className="gap-2 rounded-full"
        onClick={onRetry}
      >
        <RefreshCcw className="size-4" />
        Tentar novamente
      </Button>
    </div>
  );
}

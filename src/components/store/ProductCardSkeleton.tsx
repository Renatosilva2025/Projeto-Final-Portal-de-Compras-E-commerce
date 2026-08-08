import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder (skeleton loading) usado enquanto a API carrega. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="p-4 sm:p-5">
        <Skeleton className="aspect-square w-full rounded-lg" />
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-28 rounded-full" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

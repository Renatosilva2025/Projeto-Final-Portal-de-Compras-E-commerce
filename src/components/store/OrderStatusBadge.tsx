import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type Order } from "@/types/product";

const STATUS_STYLES: Record<Order["status"], string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
  shipped: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  delivered: "border-teal-500/30 bg-teal-500/10 text-teal-600",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-600",
};

/** Selo de situação do pedido com cor por estado. */
export function OrderStatusBadge({
  status,
  className,
}: {
  status: Order["status"];
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLES[status], className)}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

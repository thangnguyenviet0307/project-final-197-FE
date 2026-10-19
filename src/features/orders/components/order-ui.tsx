import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiError } from "@/services/api"
import { orderStatuses } from "@/features/orders/utils/order-status"
import type { OrderStatus } from "@/features/orders/types/orders"

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const colors = { 1: "bg-amber-500/10 text-amber-700 dark:text-amber-400", 2: "bg-blue-500/10 text-blue-700 dark:text-blue-400", 3: "bg-red-500/10 text-red-700 dark:text-red-400", 4: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" }
  return <Badge variant="secondary" className={colors[status]}>{orderStatuses[status] ?? "Unknown"}</Badge>
}
export function OrderQueryState({ invalid, error, retry }: { invalid?: boolean; error: unknown; retry: () => unknown }) {
  if (invalid) return <p role="alert">Invalid order ID.</p>
  if (error) return <div role="alert" className="space-y-3"><p>{getApiError(error).message}</p><Button variant="outline" onClick={() => void retry()}>Retry</Button></div>
  return <div role="status" aria-label="Loading orders" className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-64 w-full" /></div>
}

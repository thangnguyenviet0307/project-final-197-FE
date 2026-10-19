import { useQueries } from "@tanstack/react-query"
import { ShoppingBag, Clock, Package, CheckCircle2, CircleX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { listOrders } from "@/features/orders/services/orders.service"
import { orderKeys } from "@/features/orders/hooks/use-orders"
import { getApiError } from "@/services/api"

const statuses = [1, 2, 4, 3] as const
const cards = [
  { label: "Total orders", Icon: ShoppingBag, color: "text-muted-foreground" },
  { label: "Pending orders", Icon: Clock, color: "text-amber-600 dark:text-amber-400" },
  { label: "Processing orders", Icon: Package, color: "text-blue-600 dark:text-blue-400" },
  { label: "Completed orders", Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Rejected orders", Icon: CircleX, color: "text-red-600 dark:text-red-400" },
]

export function OrderStatistics() {
  // Request only one row per status; count all matching orders using Backend metadata.
  const queries = useQueries({ queries: statuses.map(orderStatus => ({
    queryKey: [...orderKeys.all, "statistics", orderStatus],
    queryFn: async ({ signal }: { signal: AbortSignal }) => (await listOrders({ page: 1, limit: 1, orderStatus }, signal)).pagination.total,
  })) })
  const complete = queries.every(query => query.data !== undefined && !query.isError)
  const total = complete ? queries.reduce((sum, query) => sum + (query.data ?? 0), 0) : undefined
  const error = queries.find(query => query.isError)?.error
  return <div className="space-y-3">
    <section aria-label="Order statistics" className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5" aria-busy={queries.some(query => query.isFetching)}>
      {cards.map(({ label, Icon, color }, index) => {
        const query = index > 0 ? queries[index - 1] : undefined
        const value = index === 0 ? total : query?.isError ? undefined : query?.data
        const loading = index === 0 ? queries.some(item => item.isPending) : query?.isPending
        return <Card key={label}><CardHeader className="flex flex-row items-center justify-between gap-2 pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle><Icon className={`size-4 shrink-0 ${color}`} /></CardHeader><CardContent>{loading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold tabular-nums">{value === undefined ? "—" : value.toLocaleString("vi-VN")}</p>}</CardContent></Card>
      })}
    </section>
    {error && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Could not load order statistics: {getApiError(error).message}</p><Button size="sm" variant="outline" onClick={() => { for (const query of queries) if (query.isError) void query.refetch() }}>Retry statistics</Button></div>}
  </div>
}

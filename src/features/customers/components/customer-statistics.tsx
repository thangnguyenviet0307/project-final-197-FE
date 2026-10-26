import { Users, CheckCircle2, CirclePause } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useCustomerStatistics } from "@/features/customers/hooks/use-customers"
import { getApiError } from "@/services/api"

const cards = [
  { label: "Tổng khách hàng", Icon: Users },
  { label: "Đang hoạt động", Icon: CheckCircle2 },
  { label: "Ngừng hoạt động", Icon: CirclePause },
]

export function CustomerStatistics() {
  const queries = useCustomerStatistics()
  const failed = queries.find(query => query.isError)
  return <div className="space-y-3">
    <section aria-label="Thống kê khách hàng" className="grid gap-4 sm:grid-cols-3" aria-busy={queries.some(query => query.isFetching)}>
      {cards.map(({ label, Icon }, index) => <Card key={label}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle><Icon className="size-5 text-muted-foreground" /></CardHeader>
        <CardContent>{queries[index].isPending ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold tabular-nums">{queries[index].isError ? "—" : queries[index].data?.toLocaleString("vi-VN") ?? "—"}</p>}</CardContent>
      </Card>)}
    </section>
    {failed && <div role="alert" className="flex flex-wrap items-center gap-2 text-sm"><p>{getApiError(failed.error).message}</p><Button variant="outline" onClick={() => { queries.forEach(query => { if (query.isError) void query.refetch() }) }}>Tải lại thống kê</Button></div>}
  </div>
}

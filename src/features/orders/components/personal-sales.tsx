import { useQuery } from "@tanstack/react-query"
import { api, getApiError } from "@/services/api"
import { formatPrice } from "@/features/products/types/products"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function PersonalSales() {
  const query = useQuery({ queryKey: ["orders", "personal-sales"], queryFn: async ({ signal }) => {
    const { data } = await api.get<{ data: { completedOrders: number; revenue: number } }>("/orders/personal-sales", { signal })
    return data.data
  } })
  return <Card><CardHeader><CardTitle>My sales</CardTitle><CardDescription>All-time completed orders assigned to you. Sales revenue, before costs; this is not profit.</CardDescription></CardHeader>
    <CardContent>{query.isPending ? <p role="status">Loading your sales...</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><Button onClick={() => void query.refetch()}>Retry personal sales</Button></div> : <div className="flex flex-wrap gap-6"><p>Completed orders: {query.data.completedOrders}</p><p>Revenue: {formatPrice(query.data.revenue)}</p></div>}</CardContent>
  </Card>
}

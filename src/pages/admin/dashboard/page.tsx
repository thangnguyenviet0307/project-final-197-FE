import { Link } from "react-router-dom"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Boxes, CheckCircle2, Package, PackageX, RefreshCw } from "lucide-react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatistics } from "@/features/orders/components/order-statistics"
import { OrderQueryState, OrderStatusBadge } from "@/features/orders/components/order-ui"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { orderCustomer, orderDate, personName } from "@/features/orders/utils/order-status"
import { useProductStatistics } from "@/features/products/hooks/use-product-statistics"
import { useProducts } from "@/features/products/hooks/use-products"
import { ProductImage } from "@/features/products/components/product-image"
import { formatPrice } from "@/features/products/types/products"
import { getApiError } from "@/services/api"
import { useAuthStore } from "@/stores/auth.store"

function ProductOverview() {
  const query = useProductStatistics()
  const cards = [
    { label: "Total products", value: query.data?.total, Icon: Package, color: "text-muted-foreground" },
    { label: "Active products", value: query.data?.active, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Out of stock", value: query.data?.outOfStock, Icon: PackageX, color: "text-amber-600 dark:text-amber-400" },
    { label: "Stock units", value: query.data?.stockUnits, Icon: Boxes, color: "text-primary" },
  ]
  return <div className="space-y-3">
    <section aria-label="Product statistics" aria-busy={query.isFetching} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, Icon, color }) => <Card key={label}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle><Icon className={`size-4 shrink-0 ${color}`} /></CardHeader>
        <CardContent>{query.isPending ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold tabular-nums">{query.isError || value === undefined ? "—" : value.toLocaleString("vi-VN")}</p>}</CardContent>
      </Card>)}
    </section>
    {query.isError && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Could not load product statistics: {getApiError(query.error).message}</p><Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry product statistics</Button></div>}
  </div>
}

function RecentOrders() {
  const query = useOrders({ page: 1, limit: 5 })
  return <Card className="min-w-0 lg:col-span-2">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Recent orders</CardTitle><Button nativeButton={false} variant="ghost" size="sm" render={<Link to="/orders" />}>View all<ArrowRight /></Button></div><CardDescription>The five most recent orders you can access.</CardDescription></CardHeader>
    <CardContent>
      {query.isPending || query.isError ? <OrderQueryState error={query.error} retry={query.refetch} /> : !query.data?.data.length ? <p className="py-12 text-center text-sm text-muted-foreground">No orders yet.</p> : <Table>
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total (₫)</TableHead></TableRow></TableHeader>
        <TableBody>{query.data.data.map(order => <TableRow key={order._id}>
          <TableCell><Link to={`/orders/${order._id}`} className="font-medium text-primary underline-offset-4 hover:underline">{order.orderCode ?? order._id}</Link></TableCell>
          <TableCell>{personName(orderCustomer(order))}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{orderDate(order.orderDate)}</TableCell>
          <TableCell><OrderStatusBadge status={order.orderStatus} /></TableCell><TableCell className="text-right tabular-nums">{formatPrice(order.totalAmount)}</TableCell>
        </TableRow>)}</TableBody>
      </Table>}
    </CardContent>
  </Card>
}

function LowStockProducts() {
  const query = useProducts({ page: 1, limit: 5, stockStatus: "low_stock" })
  return <Card className="min-w-0">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Low stock</CardTitle><Button nativeButton={false} variant="ghost" size="sm" render={<Link to="/products?stockStatus=low_stock" />}>View all<ArrowRight /></Button></div><CardDescription>Up to five products that may need restocking.</CardDescription></CardHeader>
    <CardContent>
      {query.isPending ? <div role="status" aria-label="Loading low stock products" className="space-y-4">{[1, 2, 3].map(value => <Skeleton key={value} className="h-12 w-full" />)}</div> : query.isError ? <div role="alert" className="space-y-3 text-sm"><p>{getApiError(query.error).message}</p><Button size="sm" variant="outline" onClick={() => void query.refetch()}>Retry low stock</Button></div> : !query.data?.data.length ? <p className="py-12 text-center text-sm text-muted-foreground">No low-stock products.</p> : <ul className="divide-y">
        {query.data.data.map(product => <li key={product._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <ProductImage src={product.thumbnail} alt={product.product_name} className="size-10 shrink-0 border" />
          <Link to={`/products/${product._id}`} state={{ returnTo: "/products?stockStatus=low_stock" }} className="min-w-0 flex-1 break-words text-sm font-medium underline-offset-4 hover:underline">{product.product_name}</Link>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">{product.stock ?? "—"} left</span>
        </li>)}
      </ul>}
    </CardContent>
  </Card>
}

export default function DashboardPage() {
  const client = useQueryClient()
  const fetchingOrders = useIsFetching({ queryKey: ["orders"] })
  const fetchingProducts = useIsFetching({ queryKey: ["products"] })
  const refreshing = fetchingOrders + fetchingProducts > 0
  const admin = useAuthStore(state => state.user?.role === "admin")
  return <BaseLayout title="Dashboard" description="A quick overview of orders, products and inventory.">
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{admin ? "Order statistics cover all orders." : "Order statistics cover orders assigned to you and unassigned orders."} Product statistics cover the full catalog.</p>
        <Button variant="outline" disabled={refreshing} onClick={() => void Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["products"] })])}><RefreshCw className={refreshing ? "animate-spin" : undefined} />Refresh</Button>
      </div>
      <section aria-labelledby="dashboard-orders"><h2 id="dashboard-orders" className="mb-3 text-lg font-semibold">Orders overview</h2><OrderStatistics /></section>
      <section aria-labelledby="dashboard-products"><h2 id="dashboard-products" className="mb-3 text-lg font-semibold">Products & inventory</h2><ProductOverview /></section>
      <div className="grid gap-6 lg:grid-cols-3"><RecentOrders /><LowStockProducts /></div>
    </div>
  </BaseLayout>
}

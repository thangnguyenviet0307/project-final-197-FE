import { PersonalSales } from "@/features/orders/components/personal-sales"
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
    { label: "Tổng sản phẩm", value: query.data?.total, Icon: Package, color: "text-muted-foreground" },
    { label: "Sản phẩm đang hoạt động", value: query.data?.active, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Hết hàng", value: query.data?.outOfStock, Icon: PackageX, color: "text-amber-600 dark:text-amber-400" },
    { label: "Số lượng tồn kho", value: query.data?.stockUnits, Icon: Boxes, color: "text-primary" },
  ]
  return <div className="space-y-3">
    <section aria-label="Thống kê sản phẩm" aria-busy={query.isFetching} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, Icon, color }) => <Card key={label}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2"><CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle><Icon className={`size-4 shrink-0 ${color}`} /></CardHeader>
        <CardContent>{query.isPending ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold tabular-nums">{query.isError || value === undefined ? "—" : value.toLocaleString("vi-VN")}</p>}</CardContent>
      </Card>)}
    </section>
    {query.isError && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm"><p>Không thể tải thống kê sản phẩm: {getApiError(query.error).message}</p><Button size="sm" variant="outline" onClick={() => void query.refetch()}>Tải lại thống kê sản phẩm</Button></div>}
  </div>
}

function RecentOrders() {
  const query = useOrders({ page: 1, limit: 5 })
  return <Card className="min-w-0 lg:col-span-2">
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Đơn hàng gần đây</CardTitle><Button nativeButton={false} variant="ghost" size="sm" render={<Link to="/auth/orders" />}>Xem tất cả<ArrowRight /></Button></div><CardDescription>Năm đơn hàng gần nhất bạn có quyền truy cập.</CardDescription></CardHeader>
    <CardContent>
      {query.isPending || query.isError ? <OrderQueryState error={query.error} retry={query.refetch} /> : !query.data?.data.length ? <p className="py-12 text-center text-sm text-muted-foreground">Chưa có đơn hàng.</p> : <Table>
        <TableHeader><TableRow><TableHead>Đơn hàng</TableHead><TableHead>Khách hàng</TableHead><TableHead>Ngày</TableHead><TableHead>Trạng thái</TableHead><TableHead className="text-right">Tổng tiền (₫)</TableHead></TableRow></TableHeader>
        <TableBody>{query.data.data.map(order => <TableRow key={order._id}>
          <TableCell><Link to={`/auth/orders/${order._id}`} className="font-medium text-primary underline-offset-4 hover:underline">{order.orderCode ?? order._id}</Link></TableCell>
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
    <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Sắp hết hàng</CardTitle><Button nativeButton={false} variant="ghost" size="sm" render={<Link to="/auth/products?stockStatus=low_stock" />}>Xem tất cả<ArrowRight /></Button></div><CardDescription>Tối đa năm sản phẩm có thể cần nhập thêm hàng.</CardDescription></CardHeader>
    <CardContent>
      {query.isPending ? <div role="status" aria-label="Đang tải sản phẩm sắp hết hàng" className="space-y-4">{[1, 2, 3].map(value => <Skeleton key={value} className="h-12 w-full" />)}</div> : query.isError ? <div role="alert" className="space-y-3 text-sm"><p>{getApiError(query.error).message}</p><Button size="sm" variant="outline" onClick={() => void query.refetch()}>Tải lại sản phẩm sắp hết hàng</Button></div> : !query.data?.data.length ? <p className="py-12 text-center text-sm text-muted-foreground">Không có sản phẩm sắp hết hàng.</p> : <ul className="divide-y">
        {query.data.data.map(product => <li key={product._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <ProductImage src={product.thumbnail} alt={product.product_name} className="size-10 shrink-0 border" />
          <Link to={`/auth/products/${product._id}`} state={{ returnTo: "/auth/products?stockStatus=low_stock" }} className="min-w-0 flex-1 break-words text-sm font-medium underline-offset-4 hover:underline">{product.product_name}</Link>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">{product.stock ?? "—"} còn lại</span>
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
  return <BaseLayout title="Bảng điều khiển" description="Tổng quan nhanh về đơn hàng, sản phẩm và tồn kho.">
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{admin ? "Thống kê bao gồm tất cả đơn hàng." : "Bạn có thể xem toàn bộ lịch sử đơn hàng và quản lý đơn được giao, với tối đa 5 đơn đang xử lý."} Thống kê sản phẩm bao gồm toàn bộ danh mục.</p>
        <Button variant="outline" disabled={refreshing} onClick={() => void Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["products"] })])}><RefreshCw className={refreshing ? "animate-spin" : undefined} />Làm mới</Button>
      </div>
      {!admin && <PersonalSales />}
      <section aria-labelledby="dashboard-orders"><h2 id="dashboard-orders" className="mb-3 text-lg font-semibold">Tổng quan đơn hàng</h2><OrderStatistics /></section>
      <section aria-labelledby="dashboard-products"><h2 id="dashboard-products" className="mb-3 text-lg font-semibold">Sản phẩm và tồn kho</h2><ProductOverview /></section>
      <div className="grid gap-6 lg:grid-cols-3"><RecentOrders /><LowStockProducts /></div>
    </div>
  </BaseLayout>
}

import { Link, useLocation, useSearchParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { OrderActions } from "@/features/orders/components/order-actions"
import { OrderQueryState, OrderStatusBadge } from "@/features/orders/components/order-ui"
import { useOrders } from "@/features/orders/hooks/use-orders"
import { isOrderStatus, orderCustomer, orderDate, orderStatuses, personName } from "@/features/orders/utils/order-status"
import { formatPrice } from "@/features/products/types/products"
import { ListPagination } from "@/components/list-pagination"
import { OrderStatistics } from "@/features/orders/components/order-statistics"
import { OrderDateFilter } from "@/features/orders/components/order-date-filter"
import { orderDateBoundary, validOrderDate } from "@/features/orders/utils/order-date"
import { OrderSearch } from "@/features/orders/components/order-search"
import { useQuery } from "@tanstack/react-query"
import { customersService } from "@/features/customers/services/customers.service"

function positive(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) { const number = Number(value); return Number.isSafeInteger(number) && number > 0 && number <= max ? number : fallback }
export default function AdminOrdersPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const page = positive(params.get("page"), 1)
  const limit = positive(params.get("limit"), 10, 100)
  const status = Number(params.get("orderStatus"))
  const from = params.get("dateFrom") ?? ""
  const to = params.get("dateTo") ?? ""
  const search = (params.get("search") ?? "").trim().slice(0, 100)
  const validRange = (!from || validOrderDate(from)) && (!to || validOrderDate(to)) && (!from || !to || from <= to)
  const customerId = params.get("customerId") ?? ""
  const customer = useQuery({ queryKey: ["customers", "detail", customerId], queryFn: () => customersService.getCustomerById(customerId), enabled: /^[a-f\d]{24}$/i.test(customerId) })
  const query = useOrders({ page, limit, ...(/^[a-f\d]{24}$/i.test(customerId) ? { customerId } : {}), ...(search ? { search } : {}), ...(isOrderStatus(status) ? { orderStatus: status } : {}), ...(validRange && from ? { dateFrom: orderDateBoundary(from) } : {}), ...(validRange && to ? { dateTo: orderDateBoundary(to, true) } : {}) })
  const pagination = query.data?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const orders = query.data?.data ?? []
  function change(name: string, value: string) { setParams(previous => { const updated = new URLSearchParams(previous); if (value) updated.set(name, value); else updated.delete(name); if (name !== "page") updated.set("page", "1"); return updated }) }
  return <BaseLayout title="Đơn hàng"><div className="space-y-5 px-4 lg:px-6">
    <Button nativeButton={false} render={<Link to="/auth/orders/new" />}>Create order</Button>
    <OrderStatistics />
    {customerId && <div className="rounded-lg border p-4"><p className="font-semibold">Lịch sử đơn hàng của khách hàng: {customer.data ? `${customer.data.data.first_name} ${customer.data.data.last_name}` : customerId}</p>{customer.data && <p className="text-sm">{customer.data.data.email}</p>}<Link className="text-sm underline" to="/auth/orders">Xem tất cả đơn hàng</Link></div>}
    <div><h1 className="text-2xl font-semibold">Đơn hàng</h1><p className="text-sm text-muted-foreground">Xem lịch sử và quản lý xử lý đơn hàng. Đơn mới nhất hiển thị trước.</p></div>
    <OrderSearch key={search} initial={search} onSearch={value => change("search", value)} />
    <OrderDateFilter key={`${from}/${to}`} initialFrom={from} initialTo={to} onApply={(dateFrom, dateTo) => setParams(previous => {
      const updated = new URLSearchParams(previous)
      for (const [name, value] of [["dateFrom", dateFrom], ["dateTo", dateTo]]) { if (value) updated.set(name, value); else updated.delete(name) }
      updated.set("page", "1")
      return updated
    })} />
    {!validRange && <p role="alert">Khoảng ngày trong đường dẫn không hợp lệ nên chưa được áp dụng.</p>}
    <div className="flex flex-wrap items-end gap-4"><label className="grid gap-2 text-sm">Trạng thái<select className="rounded-md border bg-background p-2" value={isOrderStatus(status) ? status : ""} onChange={event => change("orderStatus", event.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(orderStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {pagination && <p className="py-2 text-sm" role="status">{pagination.total} orders{query.isFetching ? " · Updating…" : ""}</p>}
    </div>
    {query.isPending || query.isError ? <OrderQueryState error={query.error} retry={query.refetch} /> : <>
      {!orders.length ? <div className="space-y-3 rounded-lg border p-10 text-center"><p>Không tìm thấy đơn hàng.</p>{page > 1 && <Button variant="outline" onClick={() => change("page", String(totalPages))}>Về trang đơn hàng hiện có</Button>}</div> : <div className="overflow-hidden rounded-lg border" aria-busy={query.isFetching}><Table><TableHeader><TableRow>{["Mã đơn hàng", "Khách hàng", "Contact", "Ngày đặt hàng", "Tổng cộng", "Trạng thái", "Người xử lý", "Thao tác"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{orders.map(order => {
        const customer = orderCustomer(order)
        return <TableRow key={order._id}><TableCell className="font-mono text-xs"><Link className="hover:underline" to={`/auth/orders/${order._id}`} state={{ returnTo: location.pathname + location.search }}>{order.orderCode ?? order._id}</Link></TableCell><TableCell>{personName(customer)}</TableCell><TableCell><div>{customer?.email ?? "—"}</div><div className="text-muted-foreground">{customer?.phone ?? "—"}</div></TableCell><TableCell className="whitespace-nowrap">{orderDate(order.orderDate)}</TableCell><TableCell className="whitespace-nowrap">{formatPrice(order.totalAmount)}</TableCell><TableCell><OrderStatusBadge status={order.orderStatus} /></TableCell><TableCell>{typeof order.userId === "object" ? personName(order.userId) : order.userId ?? "Chưa phân công"}</TableCell><TableCell><div className="flex items-center gap-2"><Button size="sm" variant="outline" nativeButton={false} role="link" render={<Link to={`/auth/orders/${order._id}`} state={{ returnTo: location.pathname + location.search }} />}>Xem</Button><OrderActions order={order} disabled={query.isPlaceholderData || query.isFetching} onDeleted={() => { if (orders.length === 1 && page > 1) change("page", String(page - 1)) }} /></div></TableCell></TableRow>
      })}</TableBody></Table></div>}
      <ListPagination label="Phân trang đơn hàng" page={page} totalPages={totalPages} disabled={query.isFetching} onPageChange={value => change("page", String(value))} />
    </>}
  </div></BaseLayout>
}

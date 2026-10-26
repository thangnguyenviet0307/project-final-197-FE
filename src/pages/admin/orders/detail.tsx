import { OrderNoteEditor } from "@/features/orders/components/order-note-editor"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table"
import { OrderActions } from "@/features/orders/components/order-actions"
import { OrderQueryState, OrderStatusBadge } from "@/features/orders/components/order-ui"
import { useOrder } from "@/features/orders/hooks/use-orders"
import { orderCustomer, orderDate, personName } from "@/features/orders/utils/order-status"
import { formatPrice } from "@/features/products/types/products"
import { orderItemSubtotal } from "@/features/orders/utils/order-price"
import { OrderDatesDialog } from "@/features/orders/components/order-dates-dialog"

export default function OrderDetailPage() {
  const { id = "" } = useParams()
  const query = useOrder(id)
  const location = useLocation()
  const navigate = useNavigate()
  const state: unknown = location.state
  const candidate = state && typeof state === "object" && "returnTo" in state ? state.returnTo : undefined
  const returnTo = typeof candidate === "string" && /^\/orders(?:\?|$)/.test(candidate) ? candidate : "/orders"
  const order = query.data
  const customer = order ? orderCustomer(order) : null
  return <BaseLayout title="Chi tiết đơn hàng"><div className="space-y-6 px-4 lg:px-6">
    <Button nativeButton={false} variant="outline" render={<Link to={returnTo} />}>Về danh sách đơn hàng</Button>
    {!order || query.isError ? <OrderQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} /> : <>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="break-all text-xl font-semibold">Đơn hàng {order.orderCode ?? order._id}</h1><p className="text-sm text-muted-foreground">{orderDate(order.orderDate)}</p></div><div className="flex flex-wrap items-center gap-2"><OrderStatusBadge status={order.orderStatus} /><OrderActions order={order} disabled={query.isFetching} onDeleted={() => navigate(returnTo, { replace: true })} /></div></div>
      <OrderNoteEditor key={`${order._id}-${order.orderNote}`} order={order} />
      {order.cancellationReason && <p className="text-sm">Cancellation reason: {order.cancellationReason}</p>}
      {query.isFetching && <p role="status">Đang cập nhật đơn hàng…</p>}
      <div className="grid gap-4 md:grid-cols-2"><Card><CardHeader><CardTitle>Khách hàng và giao hàng</CardTitle></CardHeader><CardContent className="space-y-2 break-words text-sm"><p className="font-medium">{personName(customer)}</p><p>{customer?.email ?? "Chưa có email"}</p><p>{customer?.phone ?? "Chưa có số điện thoại"}</p><p>{[order.street, order.city, order.state].filter(Boolean).join(", ")}</p>{order.orderNote && <p className="whitespace-pre-wrap">Ghi chú: {order.orderNote}</p>}</CardContent></Card>
        <Card><CardHeader className="flex flex-wrap items-center justify-between gap-2"><CardTitle>Thông tin đơn hàng</CardTitle><OrderDatesDialog order={order} disabled={query.isFetching} /></CardHeader><CardContent><dl className="grid grid-cols-2 gap-3 text-sm">{[
          ["Ngày tạo", orderDate(order.createdAt ?? order.orderDate)], ["Ngày yêu cầu", orderDate(order.requireDate)], ["Ngày gửi hàng dự kiến", orderDate(order.plannedShippingDate)], ["Thời điểm hoàn tất", orderDate(order.shippingDate)], ["Thanh toán", order.paymentType === 1 ? "Thanh toán khi nhận hàng (COD)" : "Chưa xác định"], ["Người xử lý", typeof order.userId === "object" ? personName(order.userId) : order.userId ?? "Chưa phân công"],
        ].map(([label, value]) => <div key={label} className="break-words"><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}</dl></CardContent></Card></div>
      <section className="space-y-3"><h2 className="text-lg font-semibold">Sản phẩm đã đặt</h2><p className="text-sm text-muted-foreground">Giá, mức giảm giá và mã SKU được lưu tại thời điểm mua. Tên sản phẩm, biến thể và tùy chọn sử dụng thông tin tại thời điểm mua nếu có. Đơn hàng cũ có thể hiển thị Chưa ghi nhận.</p>
        <div className="overflow-hidden rounded-lg border"><Table><TableHeader><TableRow>{["Mã tham chiếu sản phẩm", "Mã SKU khi mua", "Mã tham chiếu biến thể", "Số lượng", "Giá khi mua", "Giảm giá khi mua", "Thành tiền"].map(label => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{order.orderItems.map((item, index) => <TableRow key={item._id ?? index}>
          <TableCell><p className="font-medium">{item.productName ?? "Chưa ghi nhận"}</p><div className="font-mono text-xs">{typeof item.productId === "string" ? item.productId : item.productId?._id ?? "Sản phẩm không khả dụng"}</div>{typeof item.productId === "object" && item.productId?.product_name && <p className="text-sm text-muted-foreground">Tên hiện tại: {item.productId.product_name}</p>}</TableCell><TableCell>{item.sku ?? "Chưa ghi nhận"}</TableCell><TableCell><p>{item.variantName ?? "Chưa ghi nhận"}</p><p className="font-mono text-xs">{item.variantId ?? "Chưa ghi nhận"}</p><p className="text-xs text-muted-foreground">{item.selectedOptions ? Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${String(value)}`).join(", ") || "Không có tùy chọn đã chọn" : "Tùy chọn: Chưa ghi nhận"}</p></TableCell><TableCell>{item.quantity}</TableCell><TableCell>{formatPrice(item.price)}</TableCell><TableCell>{item.discount}%</TableCell>
          <TableCell>{orderItemSubtotal(item) === null ? "Không có thông tin" : formatPrice(orderItemSubtotal(item)!)}</TableCell>
        </TableRow>)}</TableBody></Table></div>
      </section>
      <Card><CardHeader><CardTitle>Tóm tắt đơn hàng</CardTitle></CardHeader><CardContent className="flex flex-wrap justify-between gap-4"><p>Tổng số lượng: {order.orderItems.reduce((total, item) => total + item.quantity, 0)}</p><p className="text-lg font-semibold">Tổng cộng: {formatPrice(order.totalAmount)}</p></CardContent></Card>
    </>}
  </div></BaseLayout>
}

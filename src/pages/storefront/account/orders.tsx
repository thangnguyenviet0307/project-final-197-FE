import { Link, useSearchParams } from "react-router-dom"
import { Package } from "lucide-react"
import { useCustomerOrders } from "@/features/orders/hooks/use-customer-orders"
import { orderStatuses, orderDate } from "@/features/orders/utils/order-status"
import { formatPrice } from "@/features/products/types/products"
import { ListPagination } from "@/components/list-pagination"
import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const query = useCustomerOrders(page)
  return <section className="space-y-6">
    <div className="border-b border-gray-200 pb-5"><h2 className="text-2xl font-bold">Đơn hàng của tôi</h2><p className="mt-2 text-sm leading-6 text-gray-500">Theo dõi các đơn hàng đã được hệ thống ghi nhận cho tài khoản của bạn.</p></div>
    {query.isPending ? <p role="status">Đang tải đơn hàng…</p> : query.isError ? <div role="alert" className="space-y-3"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : <>
      {query.data.data.length ? <div className="space-y-5">{query.data.data.map(order => <article key={order._id} className="overflow-hidden rounded-xl border border-gray-200">
        <header className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-5 py-4">
          <div><h3 className="font-bold">{order.orderCode ?? order._id}</h3><p className="mt-1 text-xs text-gray-500">{orderDate(order.orderDate)}</p></div>
          <span className="rounded-full bg-[#55b000]/10 px-3 py-1 text-sm font-semibold text-[#3c7c00]">{orderStatuses[order.orderStatus]}</span>
        </header>
        <ul className="divide-y divide-gray-100 px-5">{order.orderItems.map((item, index) => <li key={index} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <div><p className="font-medium">{item.productName || "Sản phẩm chưa có tên lưu trong đơn"}</p>{item.variantName && <p className="mt-1 text-gray-500">{item.variantName}</p>}<p className="mt-1 text-gray-500">Số lượng: {item.quantity}</p></div>
          <p>{formatPrice(item.price)} / sản phẩm{item.discount > 0 ? ` · Giảm ${item.discount}%` : ""}</p>
        </li>)}</ul>
        <footer className="space-y-2 border-t border-gray-100 px-5 py-4 text-sm"><p className="text-gray-600">Giao đến: {[order.street, order.city, order.state].filter(Boolean).join(", ")}</p>{order.cancellationReason && <p className="text-red-700">Lý do từ chối: {order.cancellationReason}</p>}<p className="text-right font-bold">Tổng tiền: <span className="text-[#459000]">{formatPrice(order.totalAmount)}</span></p></footer>
      </article>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><div className="rounded-full bg-[#55b000]/10 p-5 text-[#55b000]"><Package size={36} /></div><h3 className="mt-5 text-lg font-semibold">{page > 1 ? "Không có đơn hàng ở trang này" : "Bạn chưa có đơn hàng"}</h3><p className="mt-3 max-w-md text-sm leading-7 text-gray-500">Đơn hàng sẽ hiển thị tại đây sau khi được tạo thành công.</p><Link to="/shop" className="mt-5 font-semibold text-[#459000] hover:underline">Khám phá sản phẩm</Link></div>}
      <ListPagination label="Phân trang đơn hàng của tôi" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set("page", String(next)); return updated })} />
    </>}
  </section>
}
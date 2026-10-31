import { Link, useSearchParams } from "react-router-dom"
import { Package } from "lucide-react"
import { useCustomerOrders } from "@/features/orders/hooks/use-customer-orders"
import { CustomerOrderCard } from "@/features/orders/components/customer-order-card"
import { ListPagination } from "@/components/list-pagination"
import { Button } from "@/components/ui/button"
import { getApiError } from "@/services/api"

export default function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const query = useCustomerOrders(page)
  return <section className="space-y-6">
    <div className="flex items-start gap-4 border-b border-gray-200 pb-5"><div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-[#55b000]/10 text-[#459000] sm:flex"><Package aria-hidden="true" className="size-6" /></div><div><h2 className="text-2xl font-bold tracking-tight text-gray-900">Đơn hàng của tôi</h2><p className="mt-2 text-sm leading-6 text-gray-500">Theo dõi trạng thái và xem lại thông tin mua hàng của bạn.</p></div></div>
    {query.isPending ? <p role="status">Đang tải đơn hàng…</p> : query.isError ? <div role="alert" className="space-y-3"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : <>
      {query.data.data.length ? <div className="space-y-5">{query.data.data.map(order => <CustomerOrderCard key={order._id} order={order} />)}</div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-10 text-center"><div className="rounded-full bg-[#55b000]/10 p-5 text-[#55b000]"><Package aria-hidden="true" size={36} /></div><h3 className="mt-5 text-lg font-semibold">{page > 1 ? "Không có đơn hàng ở trang này" : "Bạn chưa có đơn hàng"}</h3><p className="mt-3 max-w-md text-sm leading-7 text-gray-500">Đơn hàng sẽ hiển thị tại đây sau khi được tạo thành công.</p><Link to="/shop" className="mt-5 rounded-xl bg-[#4d9210] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3d750c]">Khám phá sản phẩm</Link></div>}
      <ListPagination label="Phân trang đơn hàng của tôi" page={page} totalPages={Math.max(1, query.data.pagination.totalPages)} disabled={query.isFetching} onPageChange={next => setParams(previous => { const updated = new URLSearchParams(previous); updated.set("page", String(next)); return updated })} />
    </>}
  </section>
}

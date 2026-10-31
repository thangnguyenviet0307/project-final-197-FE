import { Banknote, MapPin, Package, UserRound } from "lucide-react"
import type { CustomerOrder } from "@/features/orders/types/customer-orders"
import { CustomerOrderStatus } from "@/features/orders/components/customer-order-status"
import { CustomerOrderCancel } from "@/features/orders/components/customer-order-cancel"
import { orderDate } from "@/features/orders/utils/order-status"
import { orderItemSubtotal } from "@/features/orders/utils/order-price"
import { formatPrice } from "@/features/products/types/products"

export function CustomerOrderCard({ order }: { order: CustomerOrder }) {
  const quantity = order.orderItems.reduce((total, item) => total + item.quantity, 0)
  return <article aria-label={`Đơn hàng ${order.orderCode ?? order._id}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600"><Package aria-hidden="true" className="size-5" /></div>
        <div className="min-w-0"><h3 className="break-all text-sm font-bold text-gray-900">{order.orderCode ?? order._id}</h3><p className="mt-1 text-xs text-gray-500">{orderDate(order.orderDate)}</p></div>
      </div>
      <CustomerOrderStatus order={order} />
    </header>
    <ul className="divide-y divide-gray-100 px-5 sm:px-6">{order.orderItems.map((item, index) => {
      const subtotal = orderItemSubtotal(item)
      const unitPrice = orderItemSubtotal({ ...item, quantity: 1 })
      return <li key={index} className="flex flex-wrap items-start justify-between gap-3 py-5 text-sm">
        <div className="min-w-0 flex-1 basis-40"><p className="break-words font-semibold text-gray-900">{item.productName || "Sản phẩm chưa có tên lưu trong đơn"}</p>{item.variantName && <p className="mt-1 text-xs text-gray-500">{item.variantName}</p>}<p className="mt-2 text-xs text-gray-500">Số lượng: <span className="font-medium text-gray-800">{item.quantity}</span>{unitPrice !== null && <> · Đơn giá: {formatPrice(unitPrice)} ₫</>}</p></div>
        <p className="font-semibold text-gray-900">{subtotal === null ? "Chưa có giá" : `${formatPrice(subtotal)} ₫`}</p>
      </li>
    })}</ul>
    <div className="space-y-3 border-t border-gray-100 px-5 py-4 text-sm sm:px-6">
      {(order.recipientName || order.recipientPhone) && <p className="flex items-start gap-2 text-gray-600"><UserRound aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gray-400" /><span>{[order.recipientName, order.recipientPhone].filter(Boolean).join(" · ")}</span></p>}
      <p className="flex items-start gap-2 text-gray-600"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-gray-400" /><span>{[order.street, order.city, order.state].filter(Boolean).join(", ")}</span></p>
      <p className="flex items-center gap-2 text-xs text-gray-500"><Banknote aria-hidden="true" className="size-4 text-gray-400" />Thanh toán khi nhận hàng</p>
      {order.cancellationReason && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs leading-6 text-red-700">{order.cancelledByCustomer ? "Lý do hủy" : "Lý do từ chối"}: {order.cancellationReason}</p>}
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
      <div><p className="text-xs text-gray-500">Tổng thanh toán · {quantity} sản phẩm</p><p className="mt-1 text-xl font-bold tracking-tight text-red-600">{formatPrice(order.totalAmount)} ₫</p></div>
      <CustomerOrderCancel order={order} />
    </footer>
  </article>
}

import { CircleCheck, CircleX, Clock3, PackageCheck } from "lucide-react"
import type { CustomerOrder } from "@/features/orders/types/customer-orders"
import { orderStatuses } from "@/features/orders/utils/order-status"

const appearances = {
  1: { className: "border-amber-200 bg-amber-50 text-amber-800", Icon: Clock3 },
  2: { className: "border-blue-200 bg-blue-50 text-blue-700", Icon: PackageCheck },
  3: { className: "border-red-200 bg-red-50 text-red-700", Icon: CircleX },
  4: { className: "border-emerald-200 bg-emerald-50 text-emerald-700", Icon: CircleCheck },
} as const

export function CustomerOrderStatus({ order }: { order: Pick<CustomerOrder, "orderStatus" | "cancelledByCustomer"> }) {
  const { className, Icon } = appearances[order.orderStatus]
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}>
    <Icon aria-hidden="true" className="size-3.5" />
    {order.orderStatus === 3 && order.cancelledByCustomer ? "Đã hủy" : orderStatuses[order.orderStatus]}
  </span>
}

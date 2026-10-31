import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CustomerOrder } from "@/features/orders/types/customer-orders"
import { customerOrderCancelSchema } from "@/features/orders/schemas/customer-order-cancel-schema"
import { useCancelCustomerOrder } from "@/features/orders/hooks/use-cancel-customer-order"
import { getApiError } from "@/services/api"

export function CustomerOrderCancel({ order }: { order: CustomerOrder }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [validationError, setValidationError] = useState("")
  const mutation = useCancelCustomerOrder()
  return <Dialog open={open} onOpenChange={next => { if (!mutation.isPending) setOpen(next) }}>
    {order.orderStatus === 1 && <DialogTrigger className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Hủy đơn hàng</DialogTrigger>}
    <DialogContent className="bg-white text-gray-900">
      <DialogHeader>
        <DialogTitle>Hủy đơn hàng {order.orderCode ?? order._id}</DialogTitle>
        <DialogDescription>Bạn có chắc muốn hủy đơn hàng này? Chỉ đơn đang chờ xử lý mới có thể hủy.</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <label htmlFor={`cancel-reason-${order._id}`} className="text-sm font-medium">Lý do hủy đơn</label>
        <textarea id={`cancel-reason-${order._id}`} value={reason} maxLength={1000} rows={3} disabled={mutation.isPending} onChange={event => { setReason(event.target.value); setValidationError(""); mutation.reset() }} placeholder="Nhập lý do bạn muốn hủy đơn hàng" aria-required="true" aria-invalid={!!validationError} aria-describedby={validationError ? `cancel-error-${order._id}` : undefined} className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
        {validationError && <p id={`cancel-error-${order._id}`} role="alert" className="text-sm text-red-600">{validationError}</p>}
        {mutation.isError && <p role="alert" className="text-sm text-red-600">{getApiError(mutation.error).message}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Giữ đơn hàng</Button>
        <Button variant="destructive" disabled={mutation.isPending || order.orderStatus !== 1} onClick={() => {
          const parsed = customerOrderCancelSchema.safeParse({ cancellationReason: reason })
          if (!parsed.success) { setValidationError(parsed.error.issues[0].message); return }
          mutation.mutate({ id: order._id, ...parsed.data }, { onSuccess: () => { setOpen(false); setReason("") } })
        }}>{mutation.isPending ? "Đang hủy…" : "Xác nhận hủy"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

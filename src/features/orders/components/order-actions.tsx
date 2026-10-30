import { useState } from "react"
import { LoaderCircle, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/auth.store"
import { useDeleteOrder, useUpdateOrderStatus } from "@/features/orders/hooks/use-orders"
import { orderStatuses, orderTransitions } from "@/features/orders/utils/order-status"
import { getApiError } from "@/services/api"
import type { Order, OrderStatus } from "@/features/orders/types/orders"
import { StartOrderAction } from "@/features/orders/components/start-order-action"
import { ReassignOrderAction } from "@/features/orders/components/reassign-order-action"

export function OrderActions({ order, onDeleted, disabled }: { order: Order; onDeleted: () => void; disabled?: boolean }) {
  const user = useAuthStore(state => state.user)
  const [mode, setMode] = useState<"status" | "delete" | null>(null)
  const [next, setNext] = useState<OrderStatus | "">("")
  const [reason, setReason] = useState("")
  const update = useUpdateOrderStatus()
  const remove = useDeleteOrder()
  const admin = user?.role === "admin"
  const handler = typeof order.userId === "string" ? order.userId : order.userId?._id
  const canEdit = admin || (user?.role === "staff" && handler === user.id)
  const allowed = orderTransitions[order.orderStatus] ?? []
  const pending = update.isPending || remove.isPending
  const needsClaim = admin && !order.userId && (next === 2 || next === 4)
  const valid = next !== "" && allowed.includes(next) && !needsClaim && (next !== 3 || !!reason.trim())
  const error = mode === "delete" ? remove.error : update.error
  function open(value: "status" | "delete") { update.reset(); remove.reset(); setNext(""); setReason(""); setMode(value) }
  return <>
    <StartOrderAction order={order} disabled={disabled} />
    {admin && <ReassignOrderAction order={order} disabled={disabled} />}
    {canEdit && allowed.length > 0 && <Button size="sm" variant="outline" disabled={disabled} aria-label={`Cập nhật trạng thái ${order.orderCode ?? order._id}`} onClick={() => open("status")}><Pencil className="size-4" />Cập nhật trạng thái</Button>}
    {admin && order.orderStatus === 3 && <Button size="sm" variant="destructive" disabled={disabled} aria-label={`Xóa đơn hàng ${order.orderCode ?? order._id}`} onClick={() => open("delete")}><Trash2 className="size-4" />Xóa</Button>}
    <Dialog open={mode !== null} onOpenChange={value => { if (!value && !pending) setMode(null) }}>
      <DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{mode === "delete" ? "Xóa đơn hàng đã từ chối?" : "Cập nhật trạng thái đơn hàng"}</DialogTitle>
        <DialogDescription className="break-all">Đơn hàng {order.orderCode ?? order._id}. {mode === "delete" ? "Thao tác này xóa vĩnh viễn lịch sử đơn hàng và không thể hoàn tác." : `Trạng thái hiện tại: ${orderStatuses[order.orderStatus]}. Từ chối sẽ hoàn lại tồn kho và không thể hoàn tác.`}</DialogDescription></DialogHeader>
        {mode === "status" && <><label className="grid gap-2 text-sm">Trạng thái mới<select className="rounded-md border bg-background p-2" value={next} disabled={pending} onChange={event => setNext(Number(event.target.value) as OrderStatus)}><option value="" disabled>Chọn trạng thái</option>{allowed.map(status => <option key={status} value={status}>{orderStatuses[status]}</option>)}</select></label>
          {next === 3 && <label className="grid gap-2 text-sm">Lý do hủy<textarea maxLength={1000} className="rounded-md border bg-background p-2" value={reason} required disabled={pending} onChange={event => setReason(event.target.value)} /></label>}
          {needsClaim && <p className="text-sm">Chọn Phân công và bắt đầu để chỉ định nhân viên đang hoạt động trước.</p>}
          {next !== "" && !allowed.includes(next) && <p role="alert">Đơn hàng đã thay đổi. Vui lòng chọn trạng thái khả dụng.</p>}</>}
        {error && <p role="alert" className="text-destructive">{getApiError(error).message}</p>}
        <DialogFooter><Button variant="outline" disabled={pending} onClick={() => setMode(null)}>Hủy</Button><Button variant={mode === "delete" ? "destructive" : "default"} disabled={pending || disabled || (mode === "status" && !valid) || (mode === "delete" && order.orderStatus !== 3)} onClick={() => {
          if (!user) return
          if (admin && mode === "delete" && order.orderStatus === 3) remove.mutate(order._id, { onSuccess: () => { setMode(null); onDeleted() } })
          else if (canEdit && valid) update.mutate({ id: order._id, input: { orderStatus: next, ...(next === 3 && reason.trim() ? { cancellationReason: reason.trim() } : {}) } }, { onSuccess: () => setMode(null) })
        }}>{pending && <LoaderCircle className="size-4 animate-spin" />}Xác nhận</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>
}

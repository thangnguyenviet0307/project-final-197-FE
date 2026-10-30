import { isAdministrator } from "@/features/auth/utils/roles"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { HandlerPicker } from "./start-order-action"
import { useReassignOrder } from "@/features/orders/hooks/use-orders"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"
import type { Order } from "@/features/orders/types/orders"

export function ReassignOrderAction({ order, disabled }: { order: Order; disabled?: boolean }) {
  const role = useAuthStore(state => state.user?.role)
  const [open, setOpen] = useState(false)
  const [handler, setHandler] = useState("")
  const mutation = useReassignOrder()
  const current = typeof order.userId === "string" ? order.userId : order.userId?._id
  if (!isAdministrator(role) || ![1, 2].includes(order.orderStatus)) return null
  return <>
    <Button size="sm" variant="outline" disabled={disabled || mutation.isPending} onClick={() => { mutation.reset(); setHandler(""); setOpen(true) }}>Đổi người xử lý</Button>
    <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value) }}>
      <DialogContent showCloseButton={!mutation.isPending}>
        <DialogHeader><DialogTitle>Đổi nhân viên xử lý đơn hàng</DialogTitle><DialogDescription>Chọn nhân viên đang hoạt động. Trạng thái đơn hàng và tồn kho sẽ được giữ nguyên.</DialogDescription></DialogHeader>
        {open && <HandlerPicker selected={handler} onSelect={setHandler} disabled={mutation.isPending} />}
        {mutation.error && <p role="alert" className="text-destructive">{getApiError(mutation.error).message}</p>}
        <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Hủy</Button><Button disabled={disabled || mutation.isPending || !handler || handler === current || ![1, 2].includes(order.orderStatus)} onClick={() => mutation.mutate({ id: order._id, userId: handler }, { onSuccess: () => setOpen(false) })}>Xác nhận đổi nhân viên</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>
}

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

export function OrderActions({ order, onDeleted, disabled }: { order: Order; onDeleted: () => void; disabled?: boolean }) {
  const user = useAuthStore(state => state.user)
  const [mode, setMode] = useState<"status" | "delete" | null>(null)
  const [next, setNext] = useState<OrderStatus | "">("")
  const update = useUpdateOrderStatus()
  const remove = useDeleteOrder()
  if (user?.role !== "admin") return <StartOrderAction order={order} disabled={disabled} />
  const allowed = orderTransitions[order.orderStatus] ?? []
  const pending = update.isPending || remove.isPending
  const needsClaim = !order.userId && (next === 2 || next === 4)
  const valid = next !== "" && allowed.includes(next) && !needsClaim
  const error = mode === "delete" ? remove.error : update.error
  function open(value: "status" | "delete") { update.reset(); remove.reset(); setNext(""); setMode(value) }
  return <>
    <StartOrderAction order={order} disabled={disabled} />
    {allowed.length > 0 && <Button size="sm" variant="outline" disabled={disabled} aria-label={`Update status ${order.orderCode ?? order._id}`} onClick={() => open("status")}><Pencil className="size-4" />Update status</Button>}
    {order.orderStatus === 3 && <Button size="sm" variant="destructive" disabled={disabled} aria-label={`Delete order ${order.orderCode ?? order._id}`} onClick={() => open("delete")}><Trash2 className="size-4" />Delete</Button>}
    <Dialog open={mode !== null} onOpenChange={value => { if (!value && !pending) setMode(null) }}>
      <DialogContent showCloseButton={!pending}><DialogHeader><DialogTitle>{mode === "delete" ? "Delete rejected order?" : "Update order status"}</DialogTitle>
        <DialogDescription className="break-all">Order {order.orderCode ?? order._id}. {mode === "delete" ? "This permanently deletes its order history and cannot be undone." : `Current status: ${orderStatuses[order.orderStatus]}. Rejection restores stock and cannot be reversed.`}</DialogDescription></DialogHeader>
        {mode === "status" && <><label className="grid gap-2 text-sm">New status<select className="rounded-md border bg-background p-2" value={next} disabled={pending} onChange={event => setNext(Number(event.target.value) as OrderStatus)}><option value="" disabled>Select status</option>{allowed.map(status => <option key={status} value={status}>{orderStatuses[status]}</option>)}</select></label>
          {needsClaim && <p className="text-sm">Use Assign &amp; start to select an active staff handler first.</p>}
          {next !== "" && !allowed.includes(next) && <p role="alert">This order has changed. Select an available status.</p>}</>}
        {error && <p role="alert" className="text-destructive">{getApiError(error).message}</p>}
        <DialogFooter><Button variant="outline" disabled={pending} onClick={() => setMode(null)}>Cancel</Button><Button variant={mode === "delete" ? "destructive" : "default"} disabled={pending || disabled || (mode === "status" && !valid) || (mode === "delete" && order.orderStatus !== 3)} onClick={() => {
          if (user.role !== "admin") return
          if (mode === "delete" && order.orderStatus === 3) remove.mutate(order._id, { onSuccess: () => { setMode(null); onDeleted() } })
          else if (valid) update.mutate({ id: order._id, input: { orderStatus: next } }, { onSuccess: () => setMode(null) })
        }}>{pending && <LoaderCircle className="size-4 animate-spin" />}Confirm</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </>
}

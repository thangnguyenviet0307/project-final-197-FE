import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DatePicker } from "@/features/orders/components/order-date-filter"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateOrderDates } from "@/features/orders/hooks/use-orders"
import { orderDateBoundary } from "@/features/orders/utils/order-date"
import { getApiError } from "@/services/api"
import type { Order } from "@/features/orders/types/orders"

function localDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
function localTimestamp(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  return `${localDate(value)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}
export function OrderDatesDialog({ order, disabled }: { order: Order; disabled?: boolean }) {
  const user = useAuthStore(state => state.user)
  const [open, setOpen] = useState(false)
  const [required, setRequired] = useState("")
  const [planned, setPlanned] = useState("")
  const [completed, setCompleted] = useState("")
  const mutation = useUpdateOrderDates()
  const admin = user?.role === "admin"
  const handler = typeof order.userId === "string" ? order.userId : order.userId?._id
  const active = order.orderStatus === 1 || order.orderStatus === 2
  const eligible = (active && (admin || (user?.role === "staff" && handler === user.id))) || (admin && order.orderStatus === 4)
  if (!eligible) return null
  const completion = completed ? new Date(completed) : undefined
  const invalidCompletion = !active && (!completion || Number.isNaN(completion.getTime()) || completion < new Date(order.orderDate) || completion > new Date())
  return <><Button size="sm" variant="outline" disabled={disabled} onClick={() => { setRequired(localDate(order.requireDate)); setPlanned(localDate(order.plannedShippingDate)); setCompleted(localTimestamp(order.shippingDate)); mutation.reset(); setOpen(true) }}>Edit dates</Button>
    <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value) }}><DialogContent showCloseButton={!mutation.isPending}><DialogHeader><DialogTitle>Edit order dates</DialogTitle><DialogDescription>{active ? "Set the required delivery date and planned shipping date. Dates use your local timezone." : "Correct the actual completion timestamp. This does not change the order status."}</DialogDescription></DialogHeader>
      {active ? <fieldset disabled={mutation.isPending} className="space-y-3"><DatePicker label="Required delivery date" value={required} onChange={setRequired} before={localDate(order.orderDate)} /><Button size="sm" variant="ghost" onClick={() => setRequired("")}>Clear required date</Button><DatePicker label="Planned shipping date" value={planned} onChange={setPlanned} before={localDate(order.orderDate)} /><Button size="sm" variant="ghost" onClick={() => setPlanned("")}>Clear planned date</Button></fieldset> : <label className="grid gap-2 text-sm">Completed at<input type="datetime-local" className="rounded-md border bg-background p-2" value={completed} min={localTimestamp(order.orderDate)} max={localTimestamp(new Date().toISOString())} disabled={mutation.isPending} onChange={event => setCompleted(event.target.value)} /></label>}
      {invalidCompletion && <p role="alert" className="text-sm text-destructive">Choose a completion time between order creation and now.</p>}
      {mutation.error && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={disabled || mutation.isPending || invalidCompletion} onClick={() => mutation.mutate({ id: order._id, input: active ? { requireDate: required ? orderDateBoundary(required, true) : null, plannedShippingDate: planned ? orderDateBoundary(planned, true) : null } : { shippingDate: completion!.toISOString() } }, { onSuccess: () => setOpen(false) })}>{mutation.isPending ? "Saving…" : "Save dates"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>
}

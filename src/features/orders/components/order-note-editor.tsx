import { useAuthStore } from "@/stores/auth.store"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import type { Order } from "@/features/orders/types/orders"

export function OrderNoteEditor({ order }: { order: Order }) {
  const user = useAuthStore(state => state.user)
  const handler = typeof order.userId === "string" ? order.userId : order.userId?._id
  const canEdit = user?.role === "admin" || (user?.role === "staff" && handler === user.id)
  const [note, setNote] = useState(order.orderNote ?? "")
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => api.patch(`/orders/${encodeURIComponent(order._id)}/note`, { orderNote: note }),
    meta: { successMessage: "Order note saved." },
    onSuccess: () => client.invalidateQueries({ queryKey: ["orders"] }),
  })
  if (!canEdit || order.orderStatus === 3 || order.orderStatus === 4) return <p className="text-sm">Order note: {order.orderNote || "None"}</p>
  return <form className="space-y-3 rounded-lg border p-4" onSubmit={event => { event.preventDefault(); mutation.mutate() }}>
    <label className="grid gap-2 text-sm">Order note<textarea className="rounded-md border bg-background p-2" value={note} maxLength={2000} onChange={event => setNote(event.target.value)} disabled={mutation.isPending} /></label>
    {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
    <Button type="submit" disabled={mutation.isPending || note === (order.orderNote ?? "")}>Save note</Button>
  </form>
}

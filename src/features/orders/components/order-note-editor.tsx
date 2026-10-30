import { isAdministrator } from "@/features/auth/utils/roles"
import { useAuthStore } from "@/stores/auth.store"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api, getApiError } from "@/services/api"
import { Button } from "@/components/ui/button"
import type { Order } from "@/features/orders/types/orders"

export function OrderNoteEditor({ order }: { order: Order }) {
  const user = useAuthStore(state => state.user)
  const handler = typeof order.userId === "string" ? order.userId : order.userId?._id
  const canEdit = isAdministrator(user?.role) || (user?.role === "staff" && handler === user.id)
  const serverNote = order.orderNote ?? ""
  const [draft, setDraft] = useState({ note: serverNote, base: serverNote, observed: serverNote })
  const [serverConflict, setServerConflict] = useState(false)
  if (draft.observed !== serverNote) {
    setDraft(draft.note === draft.base
      ? { note: serverNote, base: serverNote, observed: serverNote }
      : { ...draft, observed: serverNote })
  }
  const conflict = serverConflict || (draft.base !== serverNote && draft.note !== serverNote)
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: (input: { orderNote: string; expectedOrderNote: string }) => api.patch(`/orders/${encodeURIComponent(order._id)}/note`, input),
    meta: { successMessage: "Order note saved." },
    onSuccess: (_response, { orderNote: note }) => {
      setDraft({ note, base: note, observed: serverNote })
      return client.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: error => {
      if (getApiError(error).code === "ORDER_NOTE_CONFLICT") {
        setServerConflict(true)
        void client.invalidateQueries({ queryKey: ["orders"] })
      }
    },
  })
  if (!canEdit || order.orderStatus === 3 || order.orderStatus === 4) return <p className="text-sm">Order note: {order.orderNote || "None"}</p>
  return <form className="space-y-3 rounded-lg border p-4" onSubmit={event => { event.preventDefault(); if (!conflict && !mutation.isPending && draft.note !== serverNote) mutation.mutate({ orderNote: draft.note, expectedOrderNote: draft.base }) }}>
    <label className="grid gap-2 text-sm">Order note<textarea className="rounded-md border bg-background p-2" value={draft.note} maxLength={2000} onChange={event => setDraft({ ...draft, note: event.target.value })} disabled={mutation.isPending} /></label>
    {conflict && <div role="alert" className="space-y-2 text-sm">
      <p>Ghi chú đã thay đổi trên hệ thống. Bản nháp của bạn được giữ nguyên. Hãy xem nội dung mới trước khi lưu.</p>
      <p className="whitespace-pre-wrap">Ghi chú mới: {serverNote || "Không có"}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => { setServerConflict(false); mutation.reset(); setDraft({ note: serverNote, base: serverNote, observed: serverNote }) }}>Dùng ghi chú mới</Button>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => { setServerConflict(false); mutation.reset(); setDraft({ ...draft, base: serverNote, observed: serverNote }) }}>Giữ bản nháp của tôi</Button>
      </div>
    </div>}
    {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
    <Button type="submit" disabled={mutation.isPending || conflict || draft.note === serverNote}>Save note</Button>
  </form>
}

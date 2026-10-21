import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/auth.store"
import { useUsers } from "@/features/users/hooks/use-users"
import { useStartOrder } from "@/features/orders/hooks/use-orders"
import { getApiError } from "@/services/api"
import type { Order } from "@/features/orders/types/orders"

export function HandlerPicker({ onSelect, selected, disabled }: { onSelect: (id: string) => void; selected: string; disabled: boolean }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const query = useUsers(page, search, 10, { role: "staff", active: true })
  return <div className="space-y-2"><label className="grid gap-1 text-sm">Find handler<input className="rounded-md border bg-background p-2" value={search} disabled={disabled} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label>
    {query.isPending ? <p role="status">Loading handlers…</p> : query.isError ? <div role="alert"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Retry handlers</Button></div> : <>
      <div className="max-h-48 space-y-2 overflow-y-auto" aria-busy={query.isFetching}>{query.data?.data.filter(person => person.active && person.role === "staff").map(person => <label key={person._id} className="flex items-center gap-2 text-sm"><input type="radio" name="order-handler" value={person._id} checked={selected === person._id} disabled={disabled || query.isFetching} onChange={() => onSelect(person._id)} />{person.firstName} {person.lastName} ({person.email})</label>)}</div>
      {!query.data?.data.some(person => person.active && person.role === "staff") && <p>No active staff found on this page.</p>}
      <div className="flex items-center gap-2"><Button size="sm" variant="outline" disabled={disabled || page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>Previous handlers</Button><span className="text-xs">Page {page}</span><Button size="sm" variant="outline" disabled={disabled || page >= (query.data?.pagination.totalPages ?? 1) || query.isFetching} onClick={() => setPage(page + 1)}>Next handlers</Button></div>
    </>}
  </div>
}

export function StartOrderAction({ order, disabled }: { order: Order; disabled?: boolean }) {
  const user = useAuthStore(state => state.user)
  const [open, setOpen] = useState(false)
  const [handler, setHandler] = useState("")
  const mutation = useStartOrder()
  const assignee = typeof order.userId === "string" ? order.userId : order.userId?._id
  const admin = user?.role === "admin"
  const eligible = order.orderStatus === 1 && (admin || (user?.role === "staff" && (!assignee || assignee === user.id)))
  if (!eligible || !user) return null
  if (!admin) return <div className="space-y-2"><Button size="sm" disabled={disabled || mutation.isPending} onClick={() => mutation.mutate({ id: order._id })}>{mutation.isPending ? "Starting…" : "Accept & start"}</Button>{mutation.error && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}</div>
  return <><Button size="sm" disabled={disabled || mutation.isPending} onClick={() => { setHandler(""); mutation.reset(); setOpen(true) }}>Assign & start</Button>
    <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value) }}><DialogContent showCloseButton={!mutation.isPending}><DialogHeader><DialogTitle>Start processing order?</DialogTitle><DialogDescription className="break-all">Order {order.orderCode ?? order._id} will be assigned and changed from Pending to Processing.</DialogDescription></DialogHeader>
      {open && <HandlerPicker selected={handler} onSelect={setHandler} disabled={mutation.isPending} />}
      {mutation.error && <p role="alert" className="text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Cancel</Button><Button disabled={disabled || mutation.isPending || !handler} onClick={() => mutation.mutate({ id: order._id, ...(admin ? { userId: handler } : {}) }, { onSuccess: () => setOpen(false) })}>{mutation.isPending ? "Starting…" : "Confirm start"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>
}

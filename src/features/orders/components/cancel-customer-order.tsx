import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useCancelCustomerOrder } from "@/features/orders/hooks/use-customer-orders"
import { getApiError } from "@/services/api"

const reasons = ["Đổi ý, không còn nhu cầu", "Muốn thay đổi sản phẩm hoặc số lượng", "Thông tin giao hàng chưa đúng", "Thời gian giao hàng không phù hợp"]
export function CancelCustomerOrder({ id, disabled }: { id: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [other, setOther] = useState("")
  const mutation = useCancelCustomerOrder()
  const reason = [...selected, other.trim()].filter(Boolean).join("; ")
  return <><Button variant="outline" disabled={disabled} onClick={() => { mutation.reset(); setOpen(true) }}>Hủy đơn hàng</Button>
    <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value) }}><DialogContent><DialogHeader><DialogTitle>Hủy đơn hàng</DialogTitle><DialogDescription>Chọn lý do hoặc nhập lý do khác. Sau khi xác nhận, đơn hàng sẽ bị hủy và không thể khôi phục.</DialogDescription></DialogHeader>
      {reasons.map(value => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(value)} disabled={mutation.isPending} onChange={event => setSelected(previous => event.target.checked ? [...previous, value] : previous.filter(item => item !== value))} />{value}</label>)}
      <label className="grid gap-2 text-sm">Lý do khác<textarea className="rounded-md border p-2" maxLength={1000} value={other} disabled={mutation.isPending} onChange={event => setOther(event.target.value)} /></label>
      {reason.length > 1000 && <p role="alert">Tổng lý do tối đa 1000 ký tự.</p>}
      {mutation.isError && <p role="alert">{getApiError(mutation.error).message}</p>}
      <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Đóng</Button><Button variant="destructive" disabled={disabled || mutation.isPending || !reason || reason.length > 1000} onClick={() => mutation.mutate({ id, cancellationReason: reason }, { onSuccess: () => setOpen(false) })}>Xác nhận hủy đơn</Button></DialogFooter>
    </DialogContent></Dialog>
  </>
}

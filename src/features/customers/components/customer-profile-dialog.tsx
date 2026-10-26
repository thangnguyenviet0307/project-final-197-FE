import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/user-avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ICustomer } from "@/features/customers/types/customers"

function displayDate(value?: string) {
  if (!value) return "Chưa cung cấp"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Chưa cung cấp" : date.toLocaleString("vi-VN")
}

export function CustomerProfileDialog({ customer }: { customer: ICustomer }) {
  const [open, setOpen] = useState(false)
  const name = `${customer.first_name} ${customer.last_name}`.trim()
  const details = [
    ["Mã khách hàng", customer._id], ["Họ và tên", name],
    ["Email", customer.email], ["Số điện thoại", customer.phone],
    ["Đường", customer.street], ["Tỉnh/thành phố", customer.city],
    ["Bang/khu vực", customer.state],
    ["Ngày tạo", displayDate(customer.createdAt)], ["Cập nhật lần cuối", displayDate(customer.updatedAt)],
  ]
  return <Dialog open={open} onOpenChange={setOpen}>
    <Button type="button" variant="ghost" size="sm" aria-label={`Xem ${name}`} onClick={() => setOpen(true)}><Eye className="size-4" />Xem</Button>
    <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Hồ sơ khách hàng</DialogTitle><DialogDescription>Thông tin chi tiết của {name || customer.email}.</DialogDescription></DialogHeader>
      <div className="flex min-w-0 items-center gap-4 rounded-lg bg-muted/50 p-4">
        <UserAvatar name={name || customer.email} className="size-14" />
        <div className="min-w-0"><p className="wrap-break-word text-lg font-semibold">{name || "Chưa cung cấp"}</p><p className="break-all text-sm text-muted-foreground">{customer.email}</p></div>
      </div>
      <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 wrap-break-word text-sm">{value?.trim() || "Chưa cung cấp"}</dd></div>)}
        <div><dt className="text-xs text-muted-foreground">Trạng thái</dt><dd className="mt-1"><Badge variant={customer.isActive === false ? "destructive" : "secondary"}>{customer.isActive === undefined ? "Chưa xác định" : customer.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></dd></div>
      </dl>
    </DialogContent>
  </Dialog>
}

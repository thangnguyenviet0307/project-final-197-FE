import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getApiError } from "@/services/api"
import type { ManagedUser } from "@/features/users/types/users"
import { useTransferOwnership } from "@/features/users/hooks/use-transfer-ownership"

export function TransferOwnershipDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const [password, setPassword] = useState("")
  const mutation = useTransferOwnership()
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
    <DialogContent><DialogHeader><DialogTitle>Chuyển quyền Super Admin</DialogTitle>
      <DialogDescription>{user.email} sẽ trở thành Super Admin. Bạn trở thành Admin. Cả hai tài khoản phải đăng nhập lại sau khi chuyển.</DialogDescription>
    </DialogHeader>
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (password && !mutation.isPending) mutation.mutate({ targetUserId: user._id, currentPassword: password }) }}>
        <label className="grid gap-2 text-sm">Mật khẩu hiện tại của bạn<Input type="password" autoComplete="current-password" maxLength={1024} value={password} disabled={mutation.isPending} onChange={event => setPassword(event.target.value)} required /></label>
        {mutation.error && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Hủy</Button><Button type="submit" variant="destructive" disabled={!password || mutation.isPending}>Xác nhận chuyển quyền</Button></div>
      </form>
    </DialogContent>
  </Dialog>
}

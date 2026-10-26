import { useDeleteUser } from "@/features/users/hooks/use-delete-user"
import { LoaderCircle, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getApiError } from "@/services/api"

export function DeleteUserConfirmation({ id, email, open, onOpenChange, onDeleted }: {
  id: string
  email: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  const mutation = useDeleteUser(id, {
    onSuccess: onDeleted,
  })

  return <Dialog open={open} onOpenChange={(value) => {
    if (!mutation.isPending) {
      onOpenChange(value)
      if (!value) mutation.reset()
    }
  }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><TriangleAlert className="size-4 text-destructive" />Xóa tài khoản?</DialogTitle>
        <DialogDescription>Bạn sắp xóa tài khoản <strong className="break-all">{email}</strong>. Thao tác này không thể hoàn tác.</DialogDescription>
      </DialogHeader>
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Hủy</Button>
        <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending && <LoaderCircle className="animate-spin" />}Xác nhận xóa
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

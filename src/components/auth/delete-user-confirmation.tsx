import { useDeleteUser } from "@/hooks/users/use-delete-user"
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
        <DialogTitle className="flex items-center gap-2"><TriangleAlert className="size-4 text-destructive" />Delete account?</DialogTitle>
        <DialogDescription>You are about to delete the account <strong className="break-all">{email}</strong>. This action cannot be undone.</DialogDescription>
      </DialogHeader>
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending && <LoaderCircle className="animate-spin" />}Confirm deletion
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

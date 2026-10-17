import { useState } from "react"
import { useDeleteUser } from "@/hooks/users/use-delete-user"
import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "@/components/ui/popover"
import { getApiError } from "@/services/api"

export function DeleteUserButton({ id, email, disabled, onDeleted }: {
  id: string
  email: string
  disabled?: boolean
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const mutation = useDeleteUser(id, {
    onSuccess: () => { setOpen(false); onDeleted() },
  })
  return <Popover open={open} onOpenChange={(value) => {
    if (!mutation.isPending) { setOpen(value); mutation.reset() }
  }}>
    <PopoverTrigger render={<Button type="button" size="sm" variant="destructive" disabled={disabled} aria-label={`Delete account ${email}`} />}><Trash2 />Delete</PopoverTrigger>
    <PopoverContent align="end" className="w-80 gap-3 p-4">
      <PopoverTitle className="flex items-center gap-2"><TriangleAlert className="size-4 text-destructive" />Delete account?</PopoverTitle>
      <PopoverDescription>You are about to delete the account <strong className="break-all">{email}</strong>. This action cannot be undone.</PopoverDescription>
      {mutation.isError && <p role="alert" className="text-sm text-destructive">{getApiError(mutation.error).message}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending && <LoaderCircle className="animate-spin" />}Confirm deletion
        </Button>
      </div>
    </PopoverContent>
  </Popover>
}

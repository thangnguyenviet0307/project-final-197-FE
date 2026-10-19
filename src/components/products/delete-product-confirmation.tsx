import { LoaderCircle, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDeleteProduct } from "@/hooks/products/use-delete-product"
import { getApiError } from "@/services/api"
import type { Product } from "@/types/products"
export function DeleteProductConfirmation({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const mutation = useDeleteProduct()
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
    <DialogContent showCloseButton={!mutation.isPending}><DialogHeader><DialogTitle className="flex items-center gap-2"><TriangleAlert className="size-4 text-destructive" />Delete product?</DialogTitle>
      <DialogDescription>Delete “{product.product_name}”? This action cannot be undone.</DialogDescription></DialogHeader>
      {mutation.error && <p role="alert" className="text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancel</Button>
        <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate(product._id, { onSuccess: onDeleted })}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Confirm deletion</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

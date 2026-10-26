import { LoaderCircle, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDeleteProduct } from "@/features/products/hooks/use-delete-product"
import { getApiError } from "@/services/api"
import type { Product } from "@/features/products/types/products"
export function DeleteProductConfirmation({ product, onClose, onDeleted }: { product: Product; onClose: () => void; onDeleted: () => void }) {
  const mutation = useDeleteProduct()
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose() }}>
    <DialogContent showCloseButton={!mutation.isPending}><DialogHeader><DialogTitle className="flex items-center gap-2"><TriangleAlert className="size-4 text-destructive" />Xóa sản phẩm?</DialogTitle>
      <DialogDescription>Xóa “{product.product_name}”? Thao tác này không thể hoàn tác.</DialogDescription></DialogHeader>
      {mutation.error && <p role="alert" className="text-destructive">{getApiError(mutation.error).message}</p>}
      <DialogFooter><Button variant="outline" disabled={mutation.isPending} onClick={onClose}>Hủy</Button>
        <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate(product._id, { onSuccess: onDeleted })}>{mutation.isPending && <LoaderCircle className="animate-spin" />}Xác nhận xóa</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

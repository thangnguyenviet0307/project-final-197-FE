import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CartItem } from "@/features/cart/types/cart"
import { useCartStore } from "@/stores/cart.store"

export function CartRemoveConfirmation({ item }: { item: CartItem }) {
  const [open, setOpen] = useState(false)
  const removeItem = useCartStore(state => state.removeItem)
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger aria-label={`Xóa ${item.name}${item.variantLabel ? ` · ${item.variantLabel}` : ""} khỏi giỏ hàng`} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"><Trash2 size={18} /></DialogTrigger>
    <DialogContent className="bg-white text-gray-900">
      <DialogHeader>
        <DialogTitle className="sr-only">Xóa sản phẩm</DialogTitle>
        <DialogDescription>Bạn có chắc muốn xóa sản phẩm này?</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
        <Button variant="destructive" onClick={() => { removeItem(item.productId, item.variantKey); setOpen(false) }}>Xác nhận</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

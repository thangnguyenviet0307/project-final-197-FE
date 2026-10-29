import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCartStore } from "@/stores/cart.store"

export function CartClearConfirmation() {
  const [open, setOpen] = useState(false)
  const removeSelected = useCartStore(state => state.removeSelected)
  const selectedCount = useCartStore(state => state.items.filter(item => item.selected).length)

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger disabled={selectedCount === 0} className="text-sm font-medium text-red-600 underline underline-offset-4 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40">Xóa sản phẩm</DialogTrigger>
    <DialogContent className="bg-white text-gray-900">
      <DialogHeader>
        <DialogTitle className="sr-only">Xóa sản phẩm</DialogTitle>
        <DialogDescription>Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
        <Button variant="destructive" disabled={selectedCount === 0} onClick={() => { removeSelected(); setOpen(false) }}>Xác nhận</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}

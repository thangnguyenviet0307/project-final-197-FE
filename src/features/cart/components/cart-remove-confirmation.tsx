import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { CartItem } from '@/features/cart/types/cart';
import { useCartStore } from '@/stores/cart.store';

export function CartRemoveConfirmation({ item }: { item: CartItem }) {
  const [open, setOpen] = useState(false);
  const removeItem = useCartStore((state) => state.removeItem);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={`Xóa ${item.name}${item.variantLabel ? ` · ${item.variantLabel}` : ''} khỏi giỏ hàng`}
        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <Trash2 size={18} />
      </DialogTrigger>
      <DialogContent overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-none" className="gap-0 overflow-hidden border border-gray-200 bg-white p-0 text-gray-900 shadow-xl sm:max-w-md">
        <DialogHeader className="p-6 pr-10">
          <DialogTitle className="text-lg font-semibold">Xóa sản phẩm</DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            Bạn có chắc muốn xóa sản phẩm này?
          </DialogDescription>
          <p className="mt-3 break-words text-sm font-medium text-gray-900">{item.name}{item.variantLabel ? ` · ${item.variantLabel}` : ''}</p>
        </DialogHeader>
        <DialogFooter className="m-0 rounded-none border-gray-200 bg-gray-50 p-4">
          <Button variant="outline" className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            onClick={() => {
              removeItem(item.productId, item.variantKey);
              setOpen(false);
            }}
          >
            Xác nhận
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

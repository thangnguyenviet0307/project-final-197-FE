import { useState } from 'react';
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
import { useCartStore } from '@/stores/cart.store';

export function CartClearConfirmation() {
  const [open, setOpen] = useState(false);
  const removeSelected = useCartStore((state) => state.removeSelected);
  const selectedCount = useCartStore(
    (state) => state.items.filter((item) => item.selected).length
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={selectedCount === 0}
        className="text-sm font-medium text-red-600 underline underline-offset-4 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Xóa sản phẩm
      </DialogTrigger>
      <DialogContent
        overlayClassName="bg-black/40 supports-backdrop-filter:backdrop-blur-none"
        className="gap-0 overflow-hidden border border-gray-200 bg-white p-0 text-gray-900 shadow-xl sm:max-w-md"
      >
        <DialogHeader className="p-6 pr-10">
          <DialogTitle className="text-lg font-semibold">
            Xóa sản phẩm
          </DialogTitle>
          <DialogDescription className="mt-2 text-gray-600">
            Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?
          </DialogDescription>
          <p className="mt-3 text-sm font-medium text-gray-900">
            Đã chọn {selectedCount} sản phẩm.
          </p>
        </DialogHeader>
        <DialogFooter className="m-0 rounded-none border-gray-200 bg-gray-50 p-4">
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
            disabled={selectedCount === 0}
            onClick={() => {
              removeSelected();
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

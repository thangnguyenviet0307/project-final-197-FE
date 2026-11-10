import { useCategories } from '@/features/categories/hooks/use-categories';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/features/products/services/products.service';
import { useDeleteCategory } from '@/features/categories/hooks/use-delete-category';
import type { Category } from '@/features/categories/types/categories';
import { getApiError } from '@/services/api';
import { ProductQuickView } from '@/features/products/components/product-quick-view';

export function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const categories = useCategories();
  const children =
    categories.data?.filter(
      (item) =>
        (typeof item.parent === 'object' ? item.parent?._id : item.parent) ===
        category._id
    ) ?? [];
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const referenceIds = [category._id, ...selectedIds].sort().join(',');
  const selectionStale = selectedIds.some(
    (id) => !children.some((child) => child._id === id)
  );
  const products = useQuery({
    queryKey: ['products', 'category-references', referenceIds, page],
    queryFn: ({ signal }) =>
      listProducts({ category: referenceIds, page, limit: 10 }, signal),
    staleTime: 0,
  });
  const remove = useDeleteCategory({
    onSuccess: onClose,
    onError: () => {
      void products.refetch();
      void categories.refetch();
    },
  });
  const count = products.data?.pagination.total ?? 0;
  const totalPages = Math.max(1, products.data?.pagination.totalPages ?? 1);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !remove.isPending) onClose();
      }}
    >
      <DialogContent
        showCloseButton={!remove.isPending}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Xóa danh mục?</DialogTitle>
          <DialogDescription>
            Xóa danh mục "{category.name}"? Cần chuyển sản phẩm sang danh mục
            khác hoặc xóa sản phẩm trước khi xóa danh mục này.
          </DialogDescription>
        </DialogHeader>
        {categories.isPending ? (
          <p role="status">Đang kiểm tra danh mục con...</p>
        ) : categories.isError ? (
          <div role="alert">
            <p>Không thể kiểm tra danh mục con.</p>
            <Button variant="outline" onClick={() => void categories.refetch()}>
              Tải lại danh mục
            </Button>
          </div>
        ) : children.length > 0 ? (
          <div role="alert" className="rounded-lg border p-3 text-sm">
            <p>
              Tích chọn danh mục con cần xóa kèm. Danh mục con không chọn sẽ trở
              thành danh mục gốc. Nếu danh mục được chọn còn có danh mục con,
              các danh mục đó cũng được chuyển thành danh mục gốc.
            </p>
            <ul className="mt-2 max-h-60 space-y-2 overflow-y-auto">
              {children.map((child) => (
                <li key={child._id}>
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(child._id)}
                      disabled={
                        remove.isPending ||
                        (!selectedIds.includes(child._id) &&
                          selectedIds.length >= 399)
                      }
                      onChange={(event) => {
                        setSelectedIds((previous) =>
                          event.target.checked
                            ? [...previous, child._id]
                            : previous.filter((id) => id !== child._id)
                        );
                        setPage(1);
                      }}
                    />
                    <span>{child.name}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2">
              Xóa {1 + selectedIds.length} danh mục; giữ lại{' '}
              {children.length -
                selectedIds.filter((id) =>
                  children.some((child) => child._id === id)
                ).length}{' '}
              danh mục con trực tiếp.
            </p>
          </div>
        ) : null}
        {products.isPending ? (
          <p role="status">Đang kiểm tra sản phẩm liên quan...</p>
        ) : products.isError ? (
          <div role="alert" className="space-y-2">
            <p>
              Không thể kiểm tra sản phẩm liên quan.{' '}
              {getApiError(products.error).message}
            </p>
            <Button variant="outline" onClick={() => void products.refetch()}>
              Tải lại sản phẩm
            </Button>
          </div>
        ) : count > 0 ? (
          <section aria-label="Sản phẩm liên quan" className="space-y-3">
            <p className="text-sm font-medium">
              {count} sản phẩm thuộc danh mục cần xóa. Chưa thể xóa danh mục.
            </p>
            <p className="text-muted-foreground text-xs">
              Chọn một sản phẩm để xem trước tại đây.
            </p>
            <ul className="divide-y rounded-lg border px-3">
              {products.data?.data.map((product) => (
                <li key={product._id} className="py-2">
                  <ProductQuickView
                    id={product._id}
                    name={product.product_name}
                  />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <nav
                aria-label="Phân trang sản phẩm liên quan"
                className="flex flex-wrap items-center justify-end gap-2 text-sm"
              >
                <Button
                  variant="outline"
                  disabled={page <= 1 || products.isFetching}
                  onClick={() => setPage(page - 1)}
                >
                  Các sản phẩm trước
                </Button>
                <span>
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages || products.isFetching}
                  onClick={() => setPage(page + 1)}
                >
                  Các sản phẩm tiếp theo
                </Button>
              </nav>
            )}
          </section>
        ) : (
          <p className="text-muted-foreground text-sm">
            Không tìm thấy sản phẩm liên quan.
          </p>
        )}
        {remove.error && (
          <p
            role="alert"
            className="bg-destructive/15 text-destructive rounded p-3 text-sm"
          >
            {getApiError(remove.error).message}
          </p>
        )}
        {selectionStale && (
          <p role="alert" className="text-destructive text-sm">
            Danh mục con đã thay đổi. Hãy đóng hộp thoại và mở lại để chọn lại.
          </p>
        )}
        {selectedIds.length >= 399 && (
          <p role="status" className="text-muted-foreground text-sm">
            Mỗi lần có thể chọn tối đa 399 danh mục con.
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={remove.isPending}
            onClick={onClose}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            disabled={
              remove.isPending ||
              categories.isPending ||
              categories.isError ||
              categories.isFetching ||
              selectionStale ||
              products.isPending ||
              products.isFetching ||
              products.isError ||
              count > 0
            }
            onClick={() =>
              remove.mutate(
                selectedIds.length
                  ? { id: category._id, childIds: selectedIds }
                  : category._id
              )
            }
          >
            {remove.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            Xác nhận xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

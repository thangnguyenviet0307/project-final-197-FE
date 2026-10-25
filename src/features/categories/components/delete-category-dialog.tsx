import { useCategories } from "@/features/categories/hooks/use-categories"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { listProducts } from "@/features/products/services/products.service"
import { useDeleteCategory } from "@/features/categories/hooks/use-delete-category"
import type { Category } from "@/features/categories/types/categories"
import { getApiError } from "@/services/api"
import { ProductQuickView } from "@/features/products/components/product-quick-view"

export function DeleteCategoryDialog({ category, onClose }: { category: Category; onClose: () => void }) {
  const categories = useCategories()
  const children = categories.data?.filter(item => (typeof item.parent === "object" ? item.parent?._id : item.parent) === category._id) ?? []
  const [page, setPage] = useState(1)
  const products = useQuery({
    queryKey: ["products", "category-references", category._id, page],
    queryFn: ({ signal }) => listProducts({ category: category._id, page, limit: 10 }, signal),
    staleTime: 0,
  })
  const remove = useDeleteCategory({ onSuccess: onClose, onError: () => { void products.refetch() } })
  const count = products.data?.pagination.total ?? 0
  const totalPages = Math.max(1, products.data?.pagination.totalPages ?? 1)
  return <Dialog open onOpenChange={open => { if (!open && !remove.isPending) onClose() }}>
    <DialogContent showCloseButton={!remove.isPending} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Xóa danh mục?</DialogTitle><DialogDescription>Xóa danh mục "{category.name}"? Cần chuyển sản phẩm sang danh mục khác hoặc xóa sản phẩm trước khi xóa danh mục này.</DialogDescription></DialogHeader>
      {categories.isPending ? <p role="status">Đang kiểm tra danh mục con...</p> : categories.isError ? <div role="alert"><p>Không thể kiểm tra danh mục con.</p><Button variant="outline" onClick={() => void categories.refetch()}>Tải lại danh mục</Button></div> : children.length > 0 ? <div role="alert" className="rounded-lg border p-3 text-sm"><p>Xóa danh mục này sẽ chuyển {children.length} danh mục con trực tiếp thành danh mục gốc. Sản phẩm vẫn thuộc các danh mục đó.</p><ul className="mt-2 list-inside list-disc">{children.map(child => <li key={child._id}>{child.name}</li>)}</ul></div> : null}
      {products.isPending ? <p role="status">Đang kiểm tra sản phẩm liên quan...</p> : products.isError ? <div role="alert" className="space-y-2"><p>Không thể kiểm tra sản phẩm liên quan. {getApiError(products.error).message}</p><Button variant="outline" onClick={() => void products.refetch()}>Tải lại sản phẩm</Button></div> : count > 0 ? <section aria-label="Sản phẩm liên quan" className="space-y-3">
        <p className="text-sm font-medium">{count} sản phẩm thuộc danh mục này. Chưa thể xóa danh mục.</p>
        <p className="text-xs text-muted-foreground">Chọn một sản phẩm để xem trước tại đây.</p>
        <ul className="divide-y rounded-lg border px-3">{products.data?.data.map(product => <li key={product._id} className="py-2"><ProductQuickView id={product._id} name={product.product_name} /></li>)}</ul>
        {totalPages > 1 && <nav aria-label="Phân trang sản phẩm liên quan" className="flex flex-wrap items-center justify-end gap-2 text-sm"><Button variant="outline" disabled={page <= 1 || products.isFetching} onClick={() => setPage(page - 1)}>Các sản phẩm trước</Button><span>Trang {page} / {totalPages}</span><Button variant="outline" disabled={page >= totalPages || products.isFetching} onClick={() => setPage(page + 1)}>Các sản phẩm tiếp theo</Button></nav>}
      </section> : <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm liên quan.</p>}
      {remove.error && <p role="alert" className="rounded bg-destructive/15 p-3 text-sm text-destructive">{getApiError(remove.error).message}</p>}
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" disabled={remove.isPending} onClick={onClose}>Hủy bỏ</Button><Button variant="destructive" disabled={remove.isPending || categories.isPending || categories.isError || products.isFetching || products.isError || count > 0} onClick={() => remove.mutate(category._id)}>{remove.isPending && <LoaderCircle className="size-4 animate-spin" />}Xác nhận xóa</Button></div>
    </DialogContent>
  </Dialog>
}

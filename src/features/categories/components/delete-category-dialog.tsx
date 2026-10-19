import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { listProducts } from "@/features/products/services/products.service"
import { useDeleteCategory } from "@/features/categories/hooks/use-delete-category"
import type { Category } from "@/features/categories/services/categories.service"
import { getApiError } from "@/services/api"
import { ProductQuickView } from "@/features/products/components/product-quick-view"

export function DeleteCategoryDialog({ category, onClose }: { category: Category; onClose: () => void }) {
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
      <DialogHeader><DialogTitle>Delete category?</DialogTitle><DialogDescription>Delete "{category.name}"? Products must be moved to another category or deleted before this category can be removed.</DialogDescription></DialogHeader>
      {products.isPending ? <p role="status">Checking related products...</p> : products.isError ? <div role="alert" className="space-y-2"><p>Could not check related products. {getApiError(products.error).message}</p><Button variant="outline" onClick={() => void products.refetch()}>Retry products</Button></div> : count > 0 ? <section aria-label="Related products" className="space-y-3">
        <p className="text-sm font-medium">{count} products use this category. It cannot be deleted yet.</p>
        <p className="text-xs text-muted-foreground">Select a product to preview it here.</p>
        <ul className="divide-y rounded-lg border px-3">{products.data?.data.map(product => <li key={product._id} className="py-2"><ProductQuickView id={product._id} name={product.product_name} /></li>)}</ul>
        {totalPages > 1 && <nav aria-label="Related products pagination" className="flex flex-wrap items-center justify-end gap-2 text-sm"><Button variant="outline" disabled={page <= 1 || products.isFetching} onClick={() => setPage(page - 1)}>Previous products</Button><span>Page {page} of {totalPages}</span><Button variant="outline" disabled={page >= totalPages || products.isFetching} onClick={() => setPage(page + 1)}>Next products</Button></nav>}
      </section> : <p className="text-sm text-muted-foreground">No related products found.</p>}
      {remove.error && <p role="alert" className="rounded bg-destructive/15 p-3 text-sm text-destructive">{getApiError(remove.error).message}</p>}
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" disabled={remove.isPending} onClick={onClose}>Hủy bỏ</Button><Button variant="destructive" disabled={remove.isPending || products.isFetching || products.isError || count > 0} onClick={() => remove.mutate(category._id)}>{remove.isPending && <LoaderCircle className="size-4 animate-spin" />}Xác nhận xóa</Button></div>
    </DialogContent>
  </Dialog>
}

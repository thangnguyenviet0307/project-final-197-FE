import { useCallback, useState, type ReactElement } from "react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import { Eye, Pencil, Plus, Trash2, Package, CheckCircle2, PackageX, Boxes } from "lucide-react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DeleteProductConfirmation } from "@/features/products/components/delete-product-confirmation"
import { useProducts } from "@/features/products/hooks/use-products"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"
import { catalogName, formatPrice, type Product } from "@/features/products/types/products"
import { ProductFilters, type ProductFiltersValue } from "@/features/products/components/product-filters"
import { ProductImage } from "@/features/products/components/product-image"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useProductStatistics } from "@/features/products/hooks/use-product-statistics"
import { ListPagination } from "@/components/list-pagination"
import { ContentSkeleton } from "@/components/page-skeleton"
import { discountedPrice } from "@/features/products/utils/product-price"
import { AdminStoreProductLink } from "@/features/storefront/components/admin-store-product-link"

function ActionTooltip({ label, children }: { label: string; children: ReactElement }) {
  return <Tooltip><TooltipTrigger role={label === "Xóa sản phẩm" ? "button" : "link"} render={children} /><TooltipContent>{label}</TooltipContent></Tooltip>
}

export default function AdminProductsPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const linkState = { returnTo: location.pathname + location.search }
  const requestedPage = Number(params.get("page"))
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const requestedLimit = Number(params.get("limit"))
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 && requestedLimit <= 100 ? requestedLimit : 10
  const requestedStock = params.get("stockStatus")
  const stockStatus = requestedStock === "in_stock" || requestedStock === "low_stock" || requestedStock === "out_of_stock" ? requestedStock : undefined
  const filters = { search: params.get("search")?.trim() ?? "", category: params.get("category") ?? "", brand: params.get("brand") ?? "", stockStatus: stockStatus ?? "" }
  const query = useProducts({ page, limit, search: filters.search || undefined, category: filters.category || undefined, brand: filters.brand || undefined, stockStatus })
  const statistics = useProductStatistics()
  const applyFilters = useCallback((next: ProductFiltersValue) => setParams(previous => {
    const updated = new URLSearchParams(previous)
    for (const key of ["sku", "color", "size", "minPrice", "maxPrice", "sortBy", "sortOrder"]) updated.delete(key)
    for (const [key, value] of Object.entries(next)) { if (value) updated.set(key, value); else updated.delete(key) }
    updated.set("page", "1")
    return updated
  }, { replace: true }), [setParams])
  const admin = useAuthStore(state => state.user?.role === "admin")
  const [deleting, setDeleting] = useState<Product | null>(null)
  const changePage = (next: number) => setParams(previous => { previous.set("page", String(next)); return previous })
  const products = query.data?.data ?? []
  const pagination = query.data?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const stats = [
    { label: "Tổng sản phẩm", value: statistics.data?.total, Icon: Package, color: "text-muted-foreground" },
    { label: "Sản phẩm đang hoạt động", value: statistics.data?.active, Icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Hết hàng", value: statistics.data?.outOfStock, Icon: PackageX, color: "text-amber-600 dark:text-amber-400" },
    { label: "Số lượng tồn kho", value: statistics.data?.stockUnits, Icon: Boxes, color: "text-primary" },
  ]

  return <BaseLayout title="Sản phẩm" description="Quản lý danh sách sản phẩm và biến thể."><TooltipProvider><div className="space-y-4 px-4 lg:px-6">
    <section aria-label="Thống kê sản phẩm" className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-busy={statistics.isFetching}>
      {stats.map(({ label, value, Icon, color }) => <Card key={label}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
          <Icon className={`size-4 shrink-0 ${color}`} />
        </CardHeader>
        <CardContent><div className={`text-2xl font-bold ${color}`}>{statistics.isPending ? <Skeleton className="h-8 w-20" /> : value ?? "—"}</div><p className="mt-1 text-xs text-muted-foreground">Toàn bộ danh mục</p></CardContent>
      </Card>)}
    </section>
    {statistics.isError && <p role="alert" className="text-sm text-destructive">Không thể tải thống kê danh mục sản phẩm. <Button variant="outline" onClick={() => void statistics.refetch()}>Tải lại thống kê</Button></p>}
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{pagination ? `${pagination.total} products` : "Danh sách sản phẩm"}</p>
      {admin && <Button nativeButton={false} role="link" render={<Link to="/products/new" state={linkState} />}><Plus />Thêm sản phẩm</Button>}</div>
    <ProductFilters key={params.toString()} initial={filters} onChange={applyFilters} onReset={() => setParams(previous => {
      const updated = new URLSearchParams(previous)
      for (const name of ["sku", "color", "size", "search", "category", "brand", "minPrice", "maxPrice", "sortBy", "sortOrder", "stockStatus"]) updated.delete(name)
      updated.set("page", "1")
      return updated
    })} />

    {query.isPending ? <ContentSkeleton label="Đang tải sản phẩm" /> : query.isError ? <div role="alert" className="space-y-3"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Thử lại</Button></div> : <>
      {query.isFetching && <p role="status" className="text-sm text-muted-foreground">Đang cập nhật sản phẩm…</p>}
      {!products.length ? <div className="grid justify-items-center gap-3 rounded-lg border py-12"><Package className="size-8 text-muted-foreground" /><p>Không tìm thấy sản phẩm.</p>{page > 1 && <Button variant="outline" onClick={() => changePage(Math.max(1, pagination?.totalPages ?? 1))}>Về trang sản phẩm hiện có</Button>}</div> :
        <div className="overflow-hidden rounded-lg border" aria-busy={query.isFetching}><Table><TableHeader><TableRow>
          {["Sản phẩm", "Danh mục", "Thương hiệu", "Giá", "Giảm giá", "Giá sau giảm", "Biến thể", "Tồn kho", "Trạng thái", "Thao tác"].map(label => <TableHead key={label} className={label === "Tồn kho" ? "text-center" : undefined}>{label}</TableHead>)}
        </TableRow></TableHeader><TableBody>{products.map(product => {
          const salePrice = product.price === undefined ? null : discountedPrice(product.price, product.discount)
          return <TableRow key={product._id}>
          <TableCell><div className="flex min-w-56 max-w-96 items-center gap-3"><ProductImage src={product.thumbnail} alt="" className="size-12 shrink-0 object-cover" />
            <div className="min-w-0"><Link className="block truncate font-medium hover:underline" to={`/products/${product._id}`} state={linkState} title={product.product_name}>{product.product_name}</Link>
              <p className="truncate text-xs text-muted-foreground">SKU: {product.sku || "Chưa có SKU sản phẩm"}</p>
              {!!product.tags?.length && <p className="truncate text-xs text-muted-foreground" title={product.tags.join(", ")}>{product.tags.join(" · ")}</p>}
            </div></div></TableCell>
          <TableCell>{catalogName(product.category)}</TableCell><TableCell>{catalogName(product.brand)}</TableCell>
          <TableCell className="whitespace-nowrap">{product.price === undefined ? "—" : formatPrice(product.price)}</TableCell>
          <TableCell>{product.discount === undefined ? "—" : `${product.discount}%`}</TableCell>
          <TableCell className="whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">{salePrice === null ? "—" : formatPrice(salePrice)}</TableCell>
          <TableCell>{product.variants?.length ?? 0}</TableCell>
          <TableCell className="text-center"><div className="mx-auto inline-flex items-center justify-center gap-2 whitespace-nowrap">
            <span className="min-w-8 text-center tabular-nums">{product.stock ?? "—"}</span>
            <Badge className={`w-24 justify-center ${product.stock !== undefined && product.stock > 5 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : ""}`} variant={product.stock === 0 ? "destructive" : "secondary"}>
              {product.stock === undefined ? "Chưa xác định" : product.stock === 0 ? "Hết hàng" : product.stock <= 5 ? "Sắp hết hàng" : "Còn hàng"}
            </Badge>
          </div></TableCell>
          <TableCell><Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></TableCell>
          <TableCell><div className="flex gap-1"><AdminStoreProductLink product={product} compact /><ActionTooltip label="Xem sản phẩm"><Button nativeButton={false} size="icon" variant="ghost" aria-label={`View ${product.product_name}`} render={<Link to={`/products/${product._id}`} state={linkState} />}><Eye /></Button></ActionTooltip>
            {admin && <><ActionTooltip label="Chỉnh sửa sản phẩm"><Button nativeButton={false} size="icon" variant="ghost" aria-label={`Edit ${product.product_name}`} render={<Link to={`/products/${product._id}/edit`} state={linkState} />}><Pencil /></Button></ActionTooltip>
              <ActionTooltip label="Xóa sản phẩm"><Button size="icon" variant="ghost" disabled={query.isPlaceholderData} aria-label={`Delete ${product.product_name}`} onClick={() => setDeleting(product)}><Trash2 className="text-destructive" /></Button></ActionTooltip></>}</div></TableCell>
        </TableRow>})}</TableBody></Table></div>}
      <ListPagination label="Phân trang sản phẩm" page={page} totalPages={totalPages} disabled={query.isFetching} onPageChange={changePage} />
    </>}
    {deleting && <DeleteProductConfirmation key={deleting._id} product={deleting} onClose={() => setDeleting(null)} onDeleted={() => {
      setDeleting(null)
      if (products.length === 1 && page > 1) changePage(page - 1)
    }} />}
  </div></TooltipProvider></BaseLayout>
}

import { ProductDetailGallery } from "@/features/products/components/product-detail-gallery"
import { AdminStoreProductLink } from "@/features/storefront/components/admin-store-product-link"
import { discountedPrice } from "@/features/products/utils/product-price"
import { InventoryEditor } from "@/features/products/components/inventory-editor"
import { Link, useParams } from "react-router-dom"
import { Pencil, ArrowLeft } from "lucide-react"
import { BaseLayout } from "@/layout/admin/base-layout"
import { ProductQueryState } from "@/features/products/components/product-query-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/features/products/hooks/use-product"
import { useAuthStore } from "@/stores/auth.store"
import { catalogName, formatPrice } from "@/features/products/types/products"
import { ProductImage } from "@/features/products/components/product-image"
import { useProductListLocation } from "@/features/products/hooks/use-product-list-location"
import { descriptionToHtml } from "@/features/products/utils/product-description"
import "@/features/products/components/product-description.css"
import { ProductGallery } from "@/features/products/components/product-gallery"
import { ProductDetailsInfo } from "@/features/products/components/product-details-info"
import { ProductReviews } from "@/features/products/components/product-reviews"

export default function ProductDetailPage() {
  const { id = "" } = useParams()
  const query = useProduct(id)
  const admin = useAuthStore(state => state.user?.role === "admin")
  const product = query.data
  const returnTo = useProductListLocation()
  const salePrice = product?.price === undefined ? null : discountedPrice(product.price, product.discount)
  const displayDate = (value?: string) => {
    if (!value) return "—"
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN")
  }
  return <BaseLayout title={product?.product_name ?? "Chi tiết sản phẩm"}><div className="space-y-6 px-4 lg:px-6">
    <div className="flex flex-wrap items-center gap-2"><Button nativeButton={false} role="link" variant="outline" render={<Link to={returnTo} />}><ArrowLeft />Quay lại</Button>
      {product && <AdminStoreProductLink product={product} />}
      {admin && product && <Button nativeButton={false} role="link" render={<Link to={`/products/${id}/edit`} state={{ returnTo }} />}><Pencil />Chỉnh sửa</Button>}</div>
    {query.isError || !product ? <ProductQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} /> : <>
      {query.isFetching && <p role="status" className="text-sm text-muted-foreground">Đang cập nhật sản phẩm…</p>}
      <div className="grid gap-6 rounded-xl border bg-card p-4 md:grid-cols-2 lg:gap-8 lg:p-6">
        <ProductDetailGallery key={product._id} product={product} />
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{catalogName(product.brand)} · {catalogName(product.category)}</p>
            <h1 className="break-words text-2xl font-semibold tracking-tight lg:text-3xl">{product.product_name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.is_active ? "default" : "secondary"}>{product.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge>
              <Badge variant="outline">{product.stock === undefined ? "Chưa rõ tồn kho" : product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}</Badge>
            </div>
          </div>
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-sm text-muted-foreground">Giá sản phẩm (VND)</p>
            <p className="mt-1 text-3xl font-semibold">{salePrice === null ? "Chưa có thông tin" : `${formatPrice(salePrice)} ₫`}</p>
            {!!product.discount && product.price !== undefined && <p className="mt-2 text-sm"><span className="text-muted-foreground line-through">{formatPrice(product.price)} ₫</span><Badge variant="secondary" className="ml-2">Giảm {product.discount}%</Badge></p>}
            {!!product.variants?.length && <p className="mt-2 text-xs text-muted-foreground">Giá từng biến thể được hiển thị trong phần Biến thể bên dưới.</p>}
          </div>
        <dl className="grid grid-cols-2 content-start gap-3 text-sm">{[
          ["Danh mục", catalogName(product.category)], ["Thương hiệu", catalogName(product.brand)],
          ["Giá", product.price === undefined ? "—" : formatPrice(product.price)], ["Giảm giá", product.discount === undefined ? "—" : `${product.discount}%`],
          ["Tồn kho", product.stock], ["Năm sản xuất", product.model_year], ["Đường dẫn", product.slug], ["Ngày tạo", displayDate(product.createdAt)], ["Cập nhật lần cuối", displayDate(product.updatedAt)],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value ?? "—"}</dd></div>)}
          <div><dt className="text-muted-foreground">Trạng thái</dt><dd><Badge variant="secondary">{product.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></dd></div></dl>
        </div>
      </div>
      <InventoryEditor key={product._id} product={product} />
      <ProductDetailsInfo product={product} />
      <ProductReviews key={`reviews-${product._id}`} id={product._id} />
      {admin && <ProductGallery product={product} />}
      {product.description && <section><h2 className="mb-2 text-lg font-semibold">Mô tả</h2><div className="product-description-content" dangerouslySetInnerHTML={{ __html: descriptionToHtml(product.description) }} /></section>}
      <section className="space-y-4"><h2 className="text-lg font-semibold">Biến thể</h2>{!product.variants?.length && <p className="text-sm text-muted-foreground">Chưa có biến thể.</p>}
        {product.variants?.map(variant => <article key={variant._id ?? variant.sku} className="space-y-3 rounded-lg border p-4"><h3 className="font-medium">{variant.variant_name || variant.sku}</h3>
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">{[
            ["SKU", variant.sku], ["Giá", formatPrice(variant.price)], ["Tồn kho", variant.stock], ["Màu sắc", variant.color], ["Kích thước", variant.size],
            ["Giá so sánh", variant.compare_at_price == null ? null : formatPrice(variant.compare_at_price)],
            ...Object.entries(variant.attributes ?? {}).map(([name, value]) => [name, value === null ? "null" : String(value)]),
          ].map(([label, value], index) => value != null && <div key={`${label}-${index}`} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
          <div className="flex flex-wrap gap-2">{[...new Set([variant.image, ...(variant.images ?? [])].filter((url): url is string => !!url))].map(url => <ProductImage key={url} src={url} alt={variant.variant_name || variant.sku} className="size-24 border" />)}</div>
        </article>)}
      </section>
    </>}
  </div></BaseLayout>
}

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

export default function ProductDetailPage() {
  const { id = "" } = useParams()
  const query = useProduct(id)
  const admin = useAuthStore(state => state.user?.role === "admin")
  const product = query.data
  const returnTo = useProductListLocation()
  return <BaseLayout title={product?.product_name ?? "Chi tiết sản phẩm"}><div className="space-y-6 px-4 lg:px-6">
    <div className="flex gap-2"><Button nativeButton={false} role="link" variant="outline" render={<Link to={returnTo} />}><ArrowLeft />Quay lại</Button>
      {admin && product && <Button nativeButton={false} role="link" render={<Link to={`/products/${id}/edit`} state={{ returnTo }} />}><Pencil />Chỉnh sửa</Button>}</div>
    {query.isError || !product ? <ProductQueryState invalid={!/^[a-f\d]{24}$/i.test(id)} error={query.error} retry={query.refetch} /> : <>
      <div className="grid gap-6 md:grid-cols-2"><div className="space-y-3"><ProductImage src={product.thumbnail} alt={product.product_name} className="h-80 w-full rounded-lg border" />
        <div className="flex flex-wrap gap-2">{product.images?.map(image => <ProductImage key={image.public_id} src={image.secure_url} alt={product.product_name} className="size-24 border" />)}</div></div>
        <dl className="grid grid-cols-2 content-start gap-3 text-sm">{[
          ["Danh mục", catalogName(product.category)], ["Thương hiệu", catalogName(product.brand)],
          ["Giá", product.price === undefined ? "—" : formatPrice(product.price)], ["Giảm giá", product.discount === undefined ? "—" : `${product.discount}%`],
          ["Tồn kho", product.stock], ["Năm sản xuất", product.model_year], ["Đường dẫn", product.slug], ["Ngày tạo", product.createdAt], ["Updated", product.updatedAt],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value ?? "—"}</dd></div>)}
          <div><dt className="text-muted-foreground">Trạng thái</dt><dd><Badge variant="secondary">{product.is_active ? "Đang hoạt động" : "Ngừng hoạt động"}</Badge></dd></div></dl>
      </div>
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

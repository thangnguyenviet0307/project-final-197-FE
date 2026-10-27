import { useState } from "react"
import { ProductImage } from "@/features/products/components/product-image"
import type { Product } from "@/features/products/types/products"

export function ProductDetailGallery({ product }: { product: Product }) {
  const images = [...new Set([
    product.thumbnail,
    ...(product.images ?? []).map(image => image.secure_url),
    ...(product.sourceImages ?? []),
    ...(product.variants ?? []).flatMap(variant => [variant.image, ...(variant.images ?? [])]),
  ].filter((url): url is string => !!url))]
  const [selected, setSelected] = useState<string>()
  const active = selected && images.includes(selected) ? selected : images[0]

  return <section aria-label="Hình ảnh sản phẩm" className="min-w-0 space-y-3">
    <div className="overflow-hidden rounded-xl border bg-muted/20">
      <ProductImage src={active} alt={product.product_name} className="aspect-square max-h-[480px] w-full object-contain" />
    </div>
    {images.length > 0 ? <>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((url, index) => <button key={url} type="button" aria-label={`Xem ảnh ${index + 1}`} aria-pressed={active === url} onClick={() => setSelected(url)} className={`size-20 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${active === url ? "border-primary" : "border-transparent"}`}>
          <ProductImage src={url} alt="" className="size-full object-contain" />
        </button>)}
      </div>
      <p className="text-xs text-muted-foreground">{images.length} ảnh · Chọn ảnh để xem chi tiết</p>
    </> : <p className="text-sm text-muted-foreground">Chưa có hình ảnh sản phẩm.</p>}
  </section>
}

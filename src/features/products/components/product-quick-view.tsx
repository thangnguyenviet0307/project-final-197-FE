import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from "@/components/ui/popover"
import { ProductImage } from "@/features/products/components/product-image"
import { useProduct } from "@/features/products/hooks/use-product"
import { catalogName, formatPrice } from "@/features/products/types/products"
import { getApiError } from "@/services/api"

function ProductPreview({ id }: { id: string }) {
  const query = useProduct(id)
  if (query.isPending) return <p role="status">Đang tải sản phẩm...</p>
  if (query.isError) return <div role="alert" className="space-y-2"><p>{getApiError(query.error).message}</p><Button variant="outline" onClick={() => void query.refetch()}>Tải lại bản xem trước</Button></div>
  const product = query.data
  if (!product) return <p role="alert">Sản phẩm không khả dụng.</p>
  return <div className="space-y-3">
    <div className="flex items-center gap-3"><ProductImage src={product.thumbnail} alt={product.product_name} className="size-16 shrink-0 border" /><p className="min-w-0 break-words font-medium">{product.product_name}</p></div>
    <dl className="grid grid-cols-2 gap-3 text-sm">{[
      ["Danh mục", catalogName(product.category)], ["Thương hiệu", catalogName(product.brand)],
      ["Giá", product.price === undefined ? "Không có thông tin" : formatPrice(product.price)],
      ["Tồn kho", product.stock ?? "Chưa xác định"], ["Trạng thái", product.is_active ? "Đang hoạt động" : "Ngừng hoạt động"],
      ["Biến thể", product.variants?.length ?? 0],
    ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-muted-foreground">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}</dl>
    {product.variants?.length ? <div className="space-y-2"><p className="font-medium">Chi tiết biến thể</p><ul className="space-y-2">{product.variants.map(variant => <li key={variant._id ?? variant.sku} className="break-words rounded border p-2 text-xs"><p className="font-medium">{variant.variant_name || variant.sku}</p><p>Mã SKU: {variant.sku}</p><p>{[variant.color, variant.size].filter(Boolean).join(" · ")}</p><p>Tồn kho: {variant.stock ?? "Chưa xác định"} · Giá: {formatPrice(variant.price)}</p></li>)}</ul></div> : null}
  </div>
}

export function ProductQuickView({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button variant="link" className="h-auto max-w-full justify-start whitespace-normal px-0 text-left" />}>{name}</PopoverTrigger>
    <PopoverContent align="start" className="max-h-[min(70dvh,var(--available-height))] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto p-4">
      <PopoverTitle>Xem trước sản phẩm</PopoverTitle>
      <PopoverDescription>Xem sản phẩm ngay trong hộp thoại xóa danh mục.</PopoverDescription>
      {/* The portal mounts lazily and retains its contents until the exit animation finishes. */}
      <ProductPreview id={id} />
      <Button variant="outline" onClick={() => setOpen(false)}>Đóng bản xem trước</Button>
    </PopoverContent>
  </Popover>
}

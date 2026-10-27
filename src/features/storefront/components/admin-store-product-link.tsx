import { ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { Product } from "@/features/products/types/products"
export function AdminStoreProductLink({ product, compact = false }: { product: Pick<Product, "slug" | "is_active">; compact?: boolean }) {
  if (!product.slug || !product.is_active) return compact ? null : <p className="text-sm text-muted-foreground">Sản phẩm chưa được hiển thị trên cửa hàng.</p>
  return <Button nativeButton={false} role="link" variant="outline" size={compact ? "icon" : "default"} aria-label="Xem trên cửa hàng" render={<Link to={`/shop/${encodeURIComponent(product.slug)}`} target="_blank" rel="noopener noreferrer" />}><ExternalLink />{!compact && "Xem trên cửa hàng"}</Button>
}

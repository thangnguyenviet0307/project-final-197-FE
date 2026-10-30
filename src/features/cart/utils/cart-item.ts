import type { CartItem } from "@/features/cart/types/cart"
import type { Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"

export function buildCartItem(product: Product, variantKey: string, quantity: number, selected: boolean): CartItem | null {
  const variant = product.variants?.find(item => (item._id ?? item.sku) === variantKey)
  if ((product.variants?.length || variantKey) && !variant) return null
  const unitPrice = discountedPrice(variant?.price ?? product.price ?? NaN, product.discount)
  if (unitPrice === null || !product.slug) return null
  const unavailableReason = product.is_active === false || product.on_sale === false
    ? "Sản phẩm hiện ngừng bán."
    : quantity > (variant?.stock ?? product.stock ?? 0) ? "Số lượng vượt quá tồn kho hiện tại."
    : quantity < (product.minimumOrderQuantity ?? 1) ? "Số lượng chưa đạt mức đặt tối thiểu." : undefined
  return {
    product, productId: product._id, variantKey, slug: product.slug, name: product.product_name,
    variantLabel: variant ? [variant.variant_name || variant.sku, variant.color, variant.size].filter(Boolean).join(" · ") : "",
    image: variant?.image ?? product.thumbnail ?? product.images?.[0]?.secure_url ?? null,
    unitPrice, quantity, selected, ...(unavailableReason ? { unavailableReason } : {}),
  }
}

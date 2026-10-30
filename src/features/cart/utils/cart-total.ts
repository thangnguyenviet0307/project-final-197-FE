import type { CartItem } from "@/features/cart/types/cart"
import { discountedLineTotal } from "@/features/products/utils/product-price"

export function cartLineTotal(item: CartItem) {
  const variant = item.product.variants?.find(value => (value._id ?? value.sku) === item.variantKey)
  return discountedLineTotal(variant?.price ?? item.product.price ?? item.unitPrice, item.product.discount ?? 0, item.quantity) ?? 0
}
export function cartTotal(items: CartItem[]) {
  return items.reduce((cents, item) => cents + Math.round(cartLineTotal(item) * 100), 0) / 100
}

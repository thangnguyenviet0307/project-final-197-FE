import { z } from "zod"
import type { CartItem } from "@/features/cart/types/cart"

export const CART_STORAGE_KEY = "storefront-cart-v1"
const text = z.string().max(2000)
const nullableText = text.nullish()
const variantSchema = z.object({
  _id: text.optional(), sku: text, variant_name: nullableText, color: nullableText, size: nullableText,
  price: z.number().finite().nonnegative(), stock: z.number().int().nonnegative().optional(), image: nullableText,
})
const productSchema = z.object({
  _id: text, slug: text, product_name: text, price: z.number().finite().nonnegative().optional(),
  discount: z.number().min(0).max(70).optional(), stock: z.number().int().nonnegative().optional(),
  minimumOrderQuantity: z.number().int().positive().optional(), thumbnail: nullableText,
  is_active: z.boolean().optional(), on_sale: z.boolean().optional(), variants: z.array(variantSchema).max(500).optional(),
})
const storedSchema = z.object({ version: z.literal(1), items: z.array(z.object({
  product: productSchema, variantKey: text, quantity: z.number().int().positive().safe(),
})).max(500) })

export function serializeCart(items: CartItem[]) {
  return JSON.stringify({ version: 1, items: items.map(item => ({
    product: productSchema.parse({ ...item.product, thumbnail: item.product.thumbnail ?? item.product.images?.[0]?.secure_url }), variantKey: item.variantKey, quantity: item.quantity,
  })) })
}

export function parseStoredCart(value: string | null) {
  if (value === null) return []
  try { return storedSchema.parse(JSON.parse(value)).items }
  catch { return null }
}

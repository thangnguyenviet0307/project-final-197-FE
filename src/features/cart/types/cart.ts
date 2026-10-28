import type { Product } from "@/features/products/types/products"

export interface CartItem {
  product: Product
  productId: string
  variantKey: string
  slug: string
  name: string
  variantLabel: string
  image: string | null
  unitPrice: number
  quantity: number
  selected: boolean
}

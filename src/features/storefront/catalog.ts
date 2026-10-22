import referenceProducts from "./reference-products.json"
import type { ProductOption } from "./product-options"
import { storefrontProductUrl } from "@/utils/storefront-url"

// Public presentation fixtures, independent of the protected staff catalog API.
export interface StoreProduct {
  source?: "api"
  id?: string
  description?: string
  images?: string[]
  options?: ProductOption[]
  available?: boolean
  modelYear?: number
  slug: string
  name: string
  category: string
  categorySlug?: string
  brand: string
  price: number
  originalPrice: number
  image: string
  rating: number
}
export const categories = ["Headphones", "Laptops & Desktops", "Electronics", "Watch", "Camera & Video", "Accessories"]
export const products: StoreProduct[] = referenceProducts.map(product => ({
  ...product,
  // Demo-only categories; live products always use category.slug from the API.
  categorySlug: product.category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
}))
export function productUrl(product: Pick<StoreProduct, "categorySlug" | "slug">): string {
  return product.categorySlug ? storefrontProductUrl(product.categorySlug, product.slug) : "/shop"
}
export const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
export const categoryUrl = (category: string) => `/shop?category=${encodeURIComponent(category)}`

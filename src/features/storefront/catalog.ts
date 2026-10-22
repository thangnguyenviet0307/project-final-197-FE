import referenceProducts from "./reference-products.json"

// Public presentation fixtures, independent of the protected staff catalog API.
export interface StoreProduct {
  slug: string
  name: string
  category: string
  brand: string
  price: number
  originalPrice: number
  image: string
  rating: number
}
export const categories = ["Headphones", "Laptops & Desktops", "Electronics", "Watch", "Camera & Video", "Accessories"]
export const products: StoreProduct[] = referenceProducts
export const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
export const categoryUrl = (category: string) => `/shop?category=${encodeURIComponent(category)}`

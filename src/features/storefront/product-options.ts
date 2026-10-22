import { products, type StoreProduct } from "./catalog"

export interface ProductOption {
  id?: string
  sku?: string
  compareAtPrice?: number
  name: string
  color: string
  price: number
  available: boolean
  image: string
  images?: string[]
}

const asset = (filename: string) => `/storefront/amanto/${filename}`
export const blueSilenceImages = [
  "product1.jpg", "product2_3e347ac2-8e51-452b-bcdf-7dba5779701a.jpg",
  "product3.jpg", "product4.jpg", "product5.jpg",
].map(asset)

const blueSilenceOptions: ProductOption[] = [
  { name: "Black", color: "#171717", price: 125, available: true, image: blueSilenceImages[3] },
  { name: "White", color: "#fff", price: 157, available: false, image: blueSilenceImages[1] },
  { name: "Blue", color: "#2585d0", price: 140, available: true, image: blueSilenceImages[0] },
  { name: "Green", color: "#65ae29", price: 150, available: true, image: blueSilenceImages[2] },
  { name: "Orange", color: "#f89724", price: 160, available: true, image: blueSilenceImages[4] },
]

export function getProductOptions(slug: string): ProductOption[] {
  return slug === "blue-silence" ? blueSilenceOptions : []
}

export function cartKey(slug: string, option?: string): string {
  return option ? `${slug}::${option}` : slug
}

export interface StoreCartLine {
  key: string
  product: StoreProduct
  quantity: number
  option?: ProductOption
  price: number
  image: string
}

// Resolve prices from the demo catalog; persist only the chosen identity and quantity.
export function getCartLines(cart: Record<string, number>, apiProducts: Record<string, StoreProduct> = {}): StoreCartLine[] {
  return Object.entries(cart).flatMap(([key, quantity]) => {
    const [slug, optionName] = key.split("::")
    const product = apiProducts[slug] ?? products.find(item => item.slug === slug)
    const options = product?.options ?? getProductOptions(slug)
    const option = options.find(item => item.id === optionName || item.name === optionName)
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || (optionName && (!option || !option.available))) return []
    return [{ key, product, quantity, option, price: option?.price ?? product.price, image: option?.image ?? product.image }]
  })
}

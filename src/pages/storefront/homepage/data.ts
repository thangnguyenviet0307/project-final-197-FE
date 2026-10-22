import { products } from "@/features/storefront/catalog"

export const asset = (name: string) => `/storefront/amanto/${name}`
export const slides = [
  { title: "AUDIO &", accent: "ELECTRONICS", image: "slideshow-banner-v1-img1.jpg", label: "Headphone", category: "Headphones" },
  { title: "Custom &", accent: "Headlights", image: "slideshow-banner-v1-img2.jpg", label: "Phone", category: "Electronics" },
  { title: "Custom &", accent: "Headlights", image: "slideshow-banner-v1-img3.jpg", label: "Watch", category: "Watch" },
]
export const featuredGroups = [
  { label: "SALE PRODUCTS", items: products.slice(0, 8) },
  { label: "BESTSELLER PRODUCTS", items: products.slice(8, 16) },
  { label: "TOP RATE PRODUCTS", items: [products[4], products[10], products[16], products[1], products[17], products[18], products[19], products[20]] },
]
export const trendingGroups = [
  { label: "Interior", items: products.slice(8, 14) },
  { label: "Performance", items: products.slice(14, 20) },
  { label: "Lighting", items: [products[1], products[20], products[9], products[14], products[4], products[10]] },
]
export const productLists = [
  { title: "FEATURED PRODUCTS", items: [products[19], products[22], products[23]] },
  { title: "TOP RATED PRODUCTS", items: [products[14], products[19], products[1]] },
  { title: "TOP SELLING PRODUCTS", items: products.slice(8, 11) },
]

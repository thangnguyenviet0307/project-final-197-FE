export interface StorefrontVariant {
  name: string
  color: string
  image: string
  stock: number
}

export interface StorefrontProduct {
  id: string
  slug: string
  name: string
  category: string
  brand: string
  price: number
  compareAtPrice?: number
  image: string
  gallery: string[]
  badge?: string
  rating: number
  reviewCount: number
  soldCount: number
  description: string
  features: string[]
  variants: StorefrontVariant[]
}

export interface StorefrontVariant {
  name: string
  color: string
  image: string
  stock?: number
}

export interface StorefrontProduct {
  id: string
  slug: string
  name: string
  category: string
  brand: string
  price: number
  cashPrice?: number
  image: string
  gallery: string[]
  badge?: string
  description: string
  features: string[]
  variants: StorefrontVariant[]
  sourceUrl?: string
}

export type StorefrontSourceCatalogProduct = Omit<StorefrontProduct, "sourceUrl"> & { sourceUrl: string }

export interface StorefrontSourceListing {
  slug: string
  name: string
  category: string
  price: number
  cashPrice?: number
  image: string
  sourceUrl: string
}

export type AttributeValue = string | number | boolean | null
export interface CatalogReference { _id: string; name: string; isActive?: boolean; isDeleted?: boolean }
export interface ProductVariant {
  _id?: string
  sku: string
  variant_name?: string | null
  color?: string | null
  size?: string | null
  price: number
  compare_at_price?: number | null
  stock?: number
  image?: string | null
  images?: string[]
  attributes?: Record<string, AttributeValue>
}
export interface ProductInput {
  sku?: string | null
  barcode?: string | null
  currency?: "VND"
  tags?: string[]
  weight?: number | null
  dimensions?: { width: number; height: number; depth: number } | null
  warrantyInformation?: string | null
  shippingInformation?: string | null
  returnPolicy?: string | null
  minimumOrderQuantity?: number
  product_name: string
  category: string
  brand: string
  model_year?: number | null
  price?: number
  discount?: number
  description?: string | null
  thumbnail?: string | null
  slug?: string
  stock?: number
  is_active?: boolean
  variants?: ProductVariant[]
}
export interface Product extends Omit<ProductInput, "category" | "brand"> {
  source?: "dummyjson"
  external_id?: string
  sourceImages?: string[]
  sourceCreatedAt?: string
  sourceUpdatedAt?: string
  sourceCurrency?: "USD"
  importExchangeRate?: number
  _id: string
  __v?: number
  category: CatalogReference | string | null
  brand: CatalogReference | string | null
  images?: { public_id: string; secure_url: string; width?: number; height?: number; format?: string }[]
  createdAt?: string
  updatedAt?: string
}
export interface ProductMetrics { rating: number; reviewCount: number; soldCount: number }
export interface ProductReviewInput { rating: number; reviewerName: string; comment: string; date?: string }
export interface ProductReview extends ProductReviewInput {
  _id: string; product: string; source: "admin" | "dummyjson"; createdAt?: string; updatedAt?: string
}
export interface ProductReviewsResult { data: ProductReview[]; pagination: ProductsResult["pagination"] }
export type UpdateProductInput = Partial<ProductInput> & { expectedVersion?: number }
export interface ProductsQuery {
  page: number; limit: number; sku?: string; color?: string; size?: string
  search?: string; category?: string; brand?: string; minPrice?: number; maxPrice?: number
  sortBy?: "product_name" | "price" | "createdAt"; sortOrder?: "asc" | "desc"
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock"
}
export interface ProductStatistics { total: number; active: number; outOfStock: number; stockUnits: number }
export interface ProductsResult {
  data: Product[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}
export function catalogId(value: Product["category"]): string { return typeof value === "string" ? value : value?._id ?? "" }
export function catalogName(value: Product["category"]): string { return typeof value === "string" ? value : value?.name ?? "Không có thông tin" }
export const formatPrice = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(value)

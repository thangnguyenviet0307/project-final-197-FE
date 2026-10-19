import type { CatalogReference } from "@/features/products/types/products"
export interface Brand extends CatalogReference { slug: string; description?: string; logoUrl?: string }

export interface IBrand extends Brand {
  _id: string
  isActive: boolean
  isDeleted: boolean
  deletedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface IBrandOption {
  _id: string
  name: string
  brand_name: string
}

export interface CreateBrandInput {
  isActive?: boolean
  logoUrl?: string
  name: string
  description?: string
}

export interface UpdateBrandInput {
  isActive?: boolean
  logoUrl?: string
  name?: string
  description?: string
}
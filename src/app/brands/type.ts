export interface IBrand {
  _id: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
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
  name: string
  description?: string
}

export interface UpdateBrandInput {
  name?: string
  description?: string
}
import type { ApiEnvelope } from "@/types/api"
import { api, authApi } from "@/services/api"
import type { Brand } from "@/features/brands/types/brands"

import type {
  IBrand,
  PublicBrand,
  CreateBrandInput,
  UpdateBrandInput,
} from "@/features/brands/types/brands"

export type BrandApiResponse<T> = ApiEnvelope<T>

export async function listPublicBrands(signal?: AbortSignal): Promise<PublicBrand[]> {
  const response = await authApi.get<BrandApiResponse<PublicBrand[]>>("/brands/public", { signal })
  return response.data.data
}

export const brandsService = {
  // GET - Lấy danh sách Brands
  getBrands: async (signal?: AbortSignal): Promise<BrandApiResponse<IBrand[]>> => {
    const response = await api.get<BrandApiResponse<IBrand[]>>(
      "/brands", { signal }
    )

    return response.data
  },

  // GET - Danh sách Brands dùng cho Select
  getBrandsSelect: async () => {
    const response = await api.get<BrandApiResponse<IBrand[]>>(
      "/brands"
    )

    return {
      ...response.data,
      data: (response.data.data ?? []).map((brand) => ({
        _id: brand._id,
        name: brand.name,
        brand_name: brand.name,
      })),
    }
  },

  // GET - Lấy Brand theo ID
  getBrandById: async (
    id: string
  ): Promise<BrandApiResponse<IBrand>> => {
    const response = await api.get<BrandApiResponse<IBrand>>(
      `/brands/${encodeURIComponent(id)}`
    )

    return response.data
  },

  // POST - Thêm Brand
  createBrand: async (
    data: CreateBrandInput
  ): Promise<BrandApiResponse<IBrand>> => {
    const response = await api.post<BrandApiResponse<IBrand>>(
      "/brands",
      data
    )

    return response.data
  },

  // PUT - Cập nhật Brand
  updateById: async (
    id: string,
    data: UpdateBrandInput
  ): Promise<BrandApiResponse<IBrand>> => {
    const response = await api.put<BrandApiResponse<IBrand>>(
      `/brands/${encodeURIComponent(id)}`,
      data
    )

    return response.data
  },

  // DELETE - Xóa Brand
  deleteById: async (
    id: string
  ): Promise<BrandApiResponse<IBrand>> => {
    const response = await api.delete<BrandApiResponse<IBrand>>(
      `/brands/${encodeURIComponent(id)}`
    )

    return response.data
  },
}

export async function listBrands(signal?: AbortSignal): Promise<Brand[]> {
  const response = await brandsService.getBrands(signal)
  return response.data
}

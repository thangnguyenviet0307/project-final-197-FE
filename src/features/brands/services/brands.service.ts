import { api } from "@/services/api"
import type { ApiResponse } from "@/features/auth/types/auth"
import type { Brand } from "@/features/brands/types/brands"
export async function listBrands(signal?: AbortSignal): Promise<Brand[]> {
  const { data } = await api.get<ApiResponse<Brand[]>>("/brands", { signal })
  return data.data
}

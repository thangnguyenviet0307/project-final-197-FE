import { api } from "./api"
import type { ApiResponse } from "@/types/auth"
import type { Brand } from "@/types/brands"
export async function listBrands(signal?: AbortSignal): Promise<Brand[]> {
  const { data } = await api.get<ApiResponse<Brand[]>>("/brands", { signal })
  return data.data
}

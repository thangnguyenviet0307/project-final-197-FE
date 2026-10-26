import { api } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { Product, ProductInput, UpdateProductInput, ProductsQuery, ProductsResult, ProductStatistics } from "@/features/products/types/products"

export async function listProducts(params: ProductsQuery, signal?: AbortSignal): Promise<ProductsResult> {
  const { data } = await api.get<ApiResponse<Product[]> & Pick<ProductsResult, "pagination">>("/products", { params, signal })
  return { data: data.data, pagination: data.pagination }
}
export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  const { data } = await api.get<ApiResponse<Product>>(`/products/${encodeURIComponent(id)}`, { signal })
  return data.data
}
export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>("/products", input)
  return data.data
}
export async function updateProduct({ id, input }: { id: string; input: UpdateProductInput }): Promise<Product> {
  const { data } = await api.put<ApiResponse<Product>>(`/products/${encodeURIComponent(id)}`, input)
  return data.data
}
export async function deleteProduct(id: string): Promise<void> { await api.delete(`/products/${encodeURIComponent(id)}`) }

export async function getProductStatistics(signal?: AbortSignal): Promise<ProductStatistics> {
  const { data } = await api.get<ApiResponse<ProductStatistics>>("/products/statistics", { signal })
  return data.data
}
export async function uploadProductImage({ id, file, onProgress }: { id: string; file: File; onProgress?: (percent: number) => void }): Promise<Product> {
  const body = new FormData()
  body.append("image", file)
  const { data } = await api.post<ApiResponse<Product>>(`/products/${encodeURIComponent(id)}/images`, body, {
    timeout: 60_000, onUploadProgress: event => { if (event.total) onProgress?.(Math.round(event.loaded / event.total * 100)) },
  })
  return data.data
}
export async function deleteProductImage({ id, publicId }: { id: string; publicId: string }): Promise<{ cleanupPending: boolean }> {
  const { data } = await api.delete<ApiResponse<Product> & { cleanupPending: boolean }>(`/products/${encodeURIComponent(id)}/images/${encodeURIComponent(publicId)}`)
  return { cleanupPending: data.cleanupPending }
}

export interface InventoryInput { expectedVersion: number; stock?: number; variants?: { _id: string; stock: number }[] }
export async function updateInventory({ id, input }: { id: string; input: InventoryInput }): Promise<Product> {
  const { data } = await api.patch<ApiResponse<Product>>(`/products/${encodeURIComponent(id)}/inventory`, input)
  return data.data
}

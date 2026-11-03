import { api } from "@/services/api"
import type { ApiResponse } from "@/types/api"

export interface Information { content: string; publishedAt: string | null; __v: number }
export interface PublicInformation { content: string; publishedAt: string | null }
export async function getInformation(slug: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<PublicInformation | null>>(`/support/pages/${encodeURIComponent(slug)}`, { signal })
  return data.data
}
export async function getAdminInformation(slug: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<Information>>(`/support/admin/pages/${encodeURIComponent(slug)}`, { signal })
  return data.data
}
export async function saveInformation({ slug, ...input }: { slug: string; content: string; expectedVersion: number; publish: boolean }) {
  const { data } = await api.put<ApiResponse<Information>>(`/support/admin/pages/${encodeURIComponent(slug)}`, input)
  return data.data
}

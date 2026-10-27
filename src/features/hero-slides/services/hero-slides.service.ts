import { api, authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { HeroSlide, HeroSlideInput, HeroSlideUpdate, PublicHeroSlide } from "@/features/hero-slides/types/hero-slides"
export async function listHeroSlides(signal?: AbortSignal): Promise<HeroSlide[]> {
  const { data } = await api.get<ApiResponse<HeroSlide[]>>("/hero-slides", { signal }); return data.data
}
export async function listPublicHeroSlides(signal?: AbortSignal): Promise<PublicHeroSlide[]> {
  const { data } = await authApi.get<ApiResponse<PublicHeroSlide[]>>("/hero-slides/public", { signal }); return data.data
}
export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlide> {
  const { data } = await api.post<ApiResponse<HeroSlide>>("/hero-slides", input); return data.data
}
export async function updateHeroSlide({ id, input }: HeroSlideUpdate): Promise<HeroSlide> {
  const { data } = await api.patch<ApiResponse<HeroSlide>>(`/hero-slides/${encodeURIComponent(id)}`, input); return data.data
}
export async function deleteHeroSlide({ id, expectedVersion }: { id: string; expectedVersion: number }): Promise<void> {
  await api.delete(`/hero-slides/${encodeURIComponent(id)}`, { data: { expectedVersion } })
}

import { authApi } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import type { AboutPageContent, FAQPageContent } from "@/features/storefront/types/page-content"

export async function getAboutPageContent(
  signal?: AbortSignal,
): Promise<AboutPageContent> {
  const { data } = await authApi.get<ApiResponse<AboutPageContent>>(
    "/storefront/pages/about",
    { signal },
  )
  return data.data
}

export async function getFAQPageContent(
  signal?: AbortSignal,
): Promise<FAQPageContent> {
  const { data } = await authApi.get<ApiResponse<FAQPageContent>>(
    "/storefront/pages/faq",
    { signal },
  )
  return data.data
}

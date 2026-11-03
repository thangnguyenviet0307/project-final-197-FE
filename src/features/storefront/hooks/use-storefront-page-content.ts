import { useQuery } from "@tanstack/react-query"
import {
  getAboutPageContent,
  getFAQPageContent,
} from "@/features/storefront/services/page-content.service"

export function useAboutPageContent() {
  return useQuery({
    queryKey: ["storefront", "page-content", "about"],
    queryFn: ({ signal }) => getAboutPageContent(signal),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFAQPageContent() {
  return useQuery({
    queryKey: ["storefront", "page-content", "faq"],
    queryFn: ({ signal }) => getFAQPageContent(signal),
    staleTime: 5 * 60 * 1000,
  })
}

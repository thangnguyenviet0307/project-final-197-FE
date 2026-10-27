import { useQuery } from "@tanstack/react-query"
import { listPublicBrands } from "@/features/brands/services/brands.service"

export function usePublicBrands(enabled: boolean) {
  return useQuery({
    queryKey: ["brands", "public"],
    queryFn: ({ signal }) => listPublicBrands(signal),
    enabled,
  })
}

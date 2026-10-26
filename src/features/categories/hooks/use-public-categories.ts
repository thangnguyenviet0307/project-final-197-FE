import { useQuery } from "@tanstack/react-query"
import { listPublicCategories } from "@/features/categories/services/categories.service"

export function usePublicCategories(enabled: boolean) {
  return useQuery({
    queryKey: ["categories", "public"],
    queryFn: ({ signal }) => listPublicCategories(signal),
    enabled,
  })
}

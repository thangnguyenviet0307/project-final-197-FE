import { useQuery } from "@tanstack/react-query"
import { listCategories } from "@/features/categories/services/categories.service"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => listCategories(signal),
  })
}

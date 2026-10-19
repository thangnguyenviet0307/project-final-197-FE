import { useQuery } from "@tanstack/react-query"
import { getProductStatistics } from "@/services/products.service"
export function useProductStatistics() {
  return useQuery({ queryKey: ["products", "statistics"], queryFn: ({ signal }) => getProductStatistics(signal) })
}

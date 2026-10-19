import { useQuery } from "@tanstack/react-query"
import { listBrands } from "@/features/brands/services/brands.service"
export function useBrands() { return useQuery({ queryKey: ["brands"], queryFn: ({ signal }) => listBrands(signal) }) }

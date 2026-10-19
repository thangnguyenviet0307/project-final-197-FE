import { useQuery } from "@tanstack/react-query"
import { listBrands } from "@/services/brands.service"
export function useBrands() { return useQuery({ queryKey: ["brands"], queryFn: ({ signal }) => listBrands(signal) }) }

import { useQuery } from "@tanstack/react-query"
import { getStorefrontProduct } from "../services/products.service"

export function useStorefrontProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["storefront", "product", slug],
    queryFn: ({ signal }) => getStorefrontProduct(slug!, signal),
    enabled: Boolean(slug), retry: false,
    meta: { suppressGlobalErrorToast: true },
  })
}

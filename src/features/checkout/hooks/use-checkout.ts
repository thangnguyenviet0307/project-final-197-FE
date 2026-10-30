import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCheckout, getCheckoutLocations } from "@/features/checkout/services/checkout.service"
import { useCartStore } from "@/stores/cart.store"
import { useAuthStore } from "@/stores/auth.store"
import { getStoreProduct } from "@/features/storefront/services/catalog.service"
import { getApiError } from "@/services/api"

export function useCheckoutLocations() {
  return useQuery({ queryKey: ["checkout-locations", "legacy-v1"], queryFn: ({ signal }) => getCheckoutLocations(signal), staleTime: 24 * 60 * 60 * 1000 })
}
export function useCheckout() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: Parameters<typeof createCheckout>[0]) => {
      const sessionVersion = useAuthStore.getState().sessionVersion
      const result = await createCheckout(input)
      if (useAuthStore.getState().sessionVersion !== sessionVersion) throw new Error("Session changed")
      return result
    },
    retry: false,
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_result, input) => {
      useCartStore.getState().consumePurchasedItems(input.items, input.requestId)
      void client.invalidateQueries({ queryKey: ["products"] })
      void client.invalidateQueries({ queryKey: ["orders"] })
      void client.invalidateQueries({ queryKey: ["customer-orders"] })
    },
  })
}

export function useRefreshCheckoutProducts() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const slugs = [...new Set(useCartStore.getState().items.filter(item => item.selected).map(item => item.slug))]
      const missing: string[] = []
      const products = await Promise.all(slugs.map(async slug => {
        try { return await getStoreProduct(slug) }
        catch (error) { if (getApiError(error).statusCode !== 404) throw error; missing.push(slug); return null }
      }))
      useCartStore.getState().refreshProducts(products.filter(value => value !== null), missing)
    },
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["products"] }) },
  })
}

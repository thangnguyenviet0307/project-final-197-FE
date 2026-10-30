import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCheckout, getCheckoutLocations } from "@/features/checkout/services/checkout.service"
import { useCartStore } from "@/stores/cart.store"
import { useAuthStore } from "@/stores/auth.store"
import { getStoreProduct } from "@/features/storefront/services/catalog.service"

export function useCheckoutLocations() {
  return useQuery({ queryKey: ["checkout-locations", "legacy-v1"], queryFn: ({ signal }) => getCheckoutLocations(signal), staleTime: 24 * 60 * 60 * 1000 })
}
export function useCheckout() {
  const client = useQueryClient()
  return useMutation({
    onMutate: () => ({ sessionVersion: useAuthStore.getState().sessionVersion }),
    mutationFn: async (input: Parameters<typeof createCheckout>[0]) => {
      const sessionVersion = useAuthStore.getState().sessionVersion
      const result = await createCheckout(input, useAuthStore.getState().user?.accountType !== "customer")
      if (useAuthStore.getState().sessionVersion !== sessionVersion) throw new Error("Session changed")
      return result
    },
    retry: false,
    meta: { suppressGlobalErrorToast: true },
    onSuccess: (_result, input, context) => {
      if (context?.sessionVersion !== useAuthStore.getState().sessionVersion) return
      useCartStore.getState().consumePurchasedItems(input.items)
      void client.invalidateQueries({ queryKey: ["products"] })
      void client.invalidateQueries({ queryKey: ["orders"] })
      void client.invalidateQueries({ queryKey: ["customer-orders"] })
      void client.invalidateQueries({ queryKey: ["auth", "me"] })
      void client.invalidateQueries({ queryKey: ["customers"] })
    },
  })
}

export function useRefreshCheckoutProducts() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const sessionVersion = useAuthStore.getState().sessionVersion
      const slugs = [...new Set(useCartStore.getState().items.filter(item => item.selected).map(item => item.slug))]
      const products = await Promise.all(slugs.map(slug => getStoreProduct(slug)))
      if (useAuthStore.getState().sessionVersion !== sessionVersion) throw new Error("Session changed")
      useCartStore.getState().refreshProducts(products)
    },
    meta: { suppressGlobalErrorToast: true },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["products"] }) },
  })
}

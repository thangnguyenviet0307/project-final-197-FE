import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ProductsQuery } from "@/features/products/types/products"
import { listStoreProducts } from "@/features/storefront/services/catalog.service"

export function useStoreFilterCount(params: Partial<ProductsQuery>, enabled: boolean) {
  const draftKey = JSON.stringify(params)
  const [settledKey, setSettledKey] = useState(draftKey)
  useEffect(() => {
    if (!enabled || draftKey === settledKey) return
    const timer = window.setTimeout(() => setSettledKey(draftKey), 180)
    return () => window.clearTimeout(timer)
  }, [draftKey, settledKey, enabled])
  const isDebouncing = draftKey !== settledKey
  const query = useQuery({
    queryKey: ["products", "public", "filter-count", params],
    queryFn: async ({ signal }) => (await listStoreProducts({ ...params, page: 1, limit: 1 }, signal)).pagination.total,
    enabled: enabled && !isDebouncing,
    retry: false,
    staleTime: 0,
  })
  return { ...query, isFetching: query.isFetching || (enabled && isDebouncing) }
}

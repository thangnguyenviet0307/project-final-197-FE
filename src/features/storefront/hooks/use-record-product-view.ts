import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { recordProductView } from "@/features/storefront/services/catalog.service"
import type { Product } from "@/features/products/types/products"

export function useRecordProductView(slug: string, enabled: boolean, visitKey: string) {
  const recordedVisit = useRef<string | null>(null)
  const client = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: recordProductView, retry: false, meta: { suppressGlobalErrorToast: true },
    onSuccess: (result, viewedSlug) => {
      client.setQueryData<Product>(["products", "public", "detail", viewedSlug], previous => previous ? { ...previous, count_view: result.count_view } : previous)
      void client.invalidateQueries({ queryKey: ["products"], predicate: query => query.queryKey.includes("list") })
    },
  })
  useEffect(() => {
    const visit = `${visitKey}:${slug}`
    if (!enabled || recordedVisit.current === visit) return
    recordedVisit.current = visit
    mutate(slug)
  }, [enabled, slug, visitKey, mutate])
}

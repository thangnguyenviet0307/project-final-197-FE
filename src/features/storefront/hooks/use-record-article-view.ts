import { useEffect, useRef } from "react"
import { recordArticleView } from "@/features/storefront/services/articles.service"

export function useRecordArticleView(slug: string, enabled: boolean, visitKey: string) {
  const recorded = useRef<string | null>(null)
  useEffect(() => {
    const visit = `${visitKey}:${slug}`
    if (!enabled || recorded.current === visit) return
    recorded.current = visit
    // Reading remains available when metrics fail; uncertain writes are not retried.
    void recordArticleView(slug).catch(() => undefined)
  }, [slug, enabled, visitKey])
}

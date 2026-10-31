import { useEffect } from "react"
import type { PublicArticle } from "@/features/storefront/types/article"

export function useArticleHead(post: PublicArticle | undefined) {
  useEffect(() => {
    if (!post) return
    const originalTitle = document.title
    document.title = post.seo.title || post.title
    const restore: (() => void)[] = []
    function metadata(selector: string, create: () => HTMLElement, attribute: string, value: string) {
      const existing = document.head.querySelector<HTMLElement>(selector)
      const node = existing ?? create()
      const original = node.getAttribute(attribute)
      node.setAttribute(attribute, value)
      if (!existing) document.head.append(node)
      restore.push(() => {
        if (!existing) node.remove()
        else if (original === null) node.removeAttribute(attribute)
        else node.setAttribute(attribute, original)
      })
    }
    metadata('meta[name="description"]', () => {
      const node = document.createElement("meta")
      node.name = "description"
      return node
    }, "content", post.seo.description || post.excerpt)
    const fallback = new URL(`/bai-viet/${encodeURIComponent(post.slug)}`, window.location.origin).href
    let canonical = fallback
    try {
      const candidate = new URL(post.seo.canonicalUrl || fallback)
      if (["http:", "https:"].includes(candidate.protocol)) canonical = candidate.href
    } catch { /* Invalid legacy metadata uses the article URL. */ }
    metadata('link[rel="canonical"]', () => {
      const node = document.createElement("link")
      node.rel = "canonical"
      return node
    }, "href", canonical)
    return () => { document.title = originalTitle; restore.forEach(cleanup => cleanup()) }
  }, [post])
}

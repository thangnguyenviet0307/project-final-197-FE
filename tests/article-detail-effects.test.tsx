import { StrictMode } from "react"
import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { useRecordArticleView } from "@/features/storefront/hooks/use-record-article-view"
import { useArticleHead } from "@/features/storefront/hooks/use-article-head"
import { recordArticleView } from "@/features/storefront/services/articles.service"
import type { PublicArticle } from "@/features/storefront/types/article"

vi.mock("@/features/storefront/services/articles.service", () => ({ recordArticleView: vi.fn(async () => {}) }))
beforeEach(() => vi.mocked(recordArticleView).mockReset().mockResolvedValue())
it("records loaded navigation once through StrictMode/refetch and does not retry failures", async () => {
  const hook = renderHook(({ enabled, key }) => useRecordArticleView("article", enabled, key), {
    initialProps: { enabled: false, key: "first" }, wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
  })
  expect(recordArticleView).not.toHaveBeenCalled()
  hook.rerender({ enabled: true, key: "first" })
  hook.rerender({ enabled: true, key: "first" })
  expect(recordArticleView).toHaveBeenCalledTimes(1)
  vi.mocked(recordArticleView).mockRejectedValueOnce(Error("offline"))
  hook.rerender({ enabled: true, key: "second" })
  await waitFor(() => expect(recordArticleView).toHaveBeenCalledTimes(2))
  hook.rerender({ enabled: true, key: "second" })
  expect(recordArticleView).toHaveBeenCalledTimes(2)
})
it("updates article head on navigation and restores existing metadata on exit", () => {
  document.title = "Store"
  const description = document.createElement("meta")
  description.name = "description"
  description.content = "Store description"
  document.head.append(description)
  const post = { title: "Article A", slug: "article-a", excerpt: "Excerpt", seo: { title: "SEO A", description: "Description A", canonicalUrl: "https://example.com/article-a" } } as PublicArticle
  const hook = renderHook(({ post }) => useArticleHead(post), { initialProps: { post } })
  expect(document.title).toBe("SEO A")
  expect(description.content).toBe("Description A")
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://example.com/article-a")
  hook.rerender({ post: { ...post, title: "Article B", slug: "article-b", seo: {} } })
  expect(document.title).toBe("Article B")
  expect(description.content).toBe("Excerpt")
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toContain("/bai-viet/article-b")
  hook.unmount()
  expect(document.title).toBe("Store")
  expect(description.content).toBe("Store description")
  expect(document.querySelector('link[rel="canonical"]')).toBeNull()
  description.remove()
})

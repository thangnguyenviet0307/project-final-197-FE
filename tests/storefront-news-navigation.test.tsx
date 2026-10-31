import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { StoreNavbar } from "@/layout/storefront/store-navbar"
import StorefrontArticlesPage from "@/pages/storefront/articles"
import StorefrontArticleDetailPage from "@/pages/storefront/articles/detail"
import { authApi } from "@/services/api"

vi.mock("@/layout/storefront/store-departments-menu", () => ({ StoreDepartmentsMenu: () => <span>Danh mục</span> }))
vi.mock("@/layout/storefront/store-top-bar", () => ({ StoreTopBar: () => <span>Thông tin cửa hàng</span> }))
const original = authApi.defaults.adapter
const calls: { url?: string; params?: Record<string, unknown> }[] = []
let empty = false
let missing = false
let withSidebar = false
const categoryId = "b".repeat(24)
function post(type: "news" | "blog") {
  return { _id: "a".repeat(24), type, title: type === "news" ? "Tin công nghệ mới" : "Bài blog mẫu", slug: type === "news" ? "tin-cong-nghe" : "blog-mau", category: "Cẩm nang", excerpt: "Tóm tắt từ API", content: "Nội dung từ API.\n<script>alert(1)</script>", imageUrl: null, tags: [], authorName: "Biên tập", publishedAt: "2026-10-31T00:00:00Z", isFeatured: false, viewCount: 0, seo: {} }
}
beforeEach(() => {
  empty = false; missing = false; withSidebar = false; calls.length = 0
  authApi.defaults.adapter = async config => {
    calls.push({ url: config.url, params: config.params })
    let data: unknown
    if (config.url === "/articles/public/category-options") data = { data: withSidebar ? [{ _id: categoryId, name: "Mẹo sử dụng", slug: "meo-su-dung", description: "" }] : [] }
    else if (config.url === "/articles/public") {
      const sidebar = config.params.limit !== 9
      const article = { ...post(config.params.type), ...(sidebar ? { title: config.params.sort === "popular" ? "Bài được đọc nhiều" : "Bài vừa xuất bản", slug: config.params.sort === "popular" ? "doc-nhieu" : "bai-moi", viewCount: 1234 } : {}) }
      data = { data: empty || (sidebar && !withSidebar) ? [] : [article], pagination: { page: config.params.page, limit: config.params.limit, total: empty ? 0 : 10, totalPages: empty ? 0 : 2 } }
    }
    else if (config.url?.endsWith("/views")) data = { data: null }
    else if (config.url?.startsWith("/articles/public/")) {
      if (missing) throw new AxiosError("Not found", "ERR_BAD_REQUEST", config, undefined, { config, headers: new AxiosHeaders(), status: 404, statusText: "Not found", data: { message: "Không tìm thấy bài viết." } })
      data = { data: post(config.url.endsWith("blog-mau") ? "blog" : "news") }
    } else throw new Error(`Unexpected article request: ${config.url}`)
    return { config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data }
  }
})
afterEach(() => { authApi.defaults.adapter = original })
function setup(path = "/shop") {
  const router = createMemoryRouter([{ element: <><StoreNavbar /><Outlet /></>, children: [
    { path: "/shop", element: <p>Shop</p> }, { path: "/bai-viet", element: <StorefrontArticlesPage /> }, { path: "/bai-viet/:slug", element: <StorefrontArticleDetailPage /> },
  ] }], { initialEntries: [path] })
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
  return router
}
it("opens API news from the navbar and preserves blog/search/page when returning from detail", async () => {
  const router = setup()
  const news = screen.getByRole("link", { name: "TIN TỨC" })
  expect(news.getAttribute("href")).toBe("/bai-viet?type=news")
  fireEvent.click(news)
  await screen.findByRole("heading", { name: "Tin công nghệ mới" })
  expect(calls.filter(call => call.url === "/articles/public" && call.params?.limit === 9).at(-1)?.params).toMatchObject({ type: "news", page: 1, limit: 9, summary: true })
  fireEvent.click(screen.getByRole("link", { name: "Blog" }))
  await screen.findByRole("heading", { name: "Bài blog mẫu" })
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm tin tức" }), { target: { value: "cáp" } })
  fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
  await waitFor(() => expect(calls.filter(call => call.url === "/articles/public" && call.params?.limit === 9).at(-1)?.params).toMatchObject({ type: "blog", search: "cáp", page: 1 }))
  await waitFor(() => expect((screen.getByRole("button", { name: "Trang 2" }) as HTMLButtonElement).disabled).toBe(false))
  fireEvent.click(screen.getByRole("button", { name: "Trang 2" }))
  await waitFor(() => expect(calls.filter(call => call.url === "/articles/public" && call.params?.limit === 9).at(-1)?.params).toMatchObject({ type: "blog", search: "cáp", page: 2 }))
  const returnTo = router.state.location.pathname + router.state.location.search
  fireEvent.click(await screen.findByRole("link", { name: /Bài blog mẫu/ }))
  await screen.findByText(/Nội dung từ API/)
  expect(document.querySelector("main script")).toBeNull()
  expect(screen.getByRole("link", { name: "Tất cả bài viết" }).getAttribute("href")).toBe(returnTo)
  fireEvent.click(screen.getByRole("link", { name: "Tất cả bài viết" }))
  await screen.findByRole("heading", { name: "Bài blog mẫu" })
  expect(router.state.location.pathname + router.state.location.search).toBe(returnTo)
})
it("opens the real news route from mobile and closes the menu", async () => {
  const router = setup()
  fireEvent.click(screen.getByRole("button", { name: "Mở menu điều hướng" }))
  fireEvent.click(screen.getAllByRole("link", { name: "TIN TỨC" }).at(-1)!)
  await screen.findByRole("heading", { name: "Tin công nghệ mới" })
  expect(router.state.location.search).toBe("?type=news")
  expect(screen.queryByRole("button", { name: "Đóng menu điều hướng" })).toBeNull()
})
it("handles an empty API list and unavailable detail without fabricating articles", async () => {
  empty = true
  const router = setup("/bai-viet?type=blog")
  await screen.findByText("Chưa có bài viết phù hợp.")
  missing = true
  await act(async () => { await router.navigate("/bai-viet/missing-article") })
  expect((await screen.findByRole("alert")).textContent).toContain("Không tìm thấy bài viết")
  expect(screen.getByRole("link", { name: "Tất cả bài viết" })).toBeTruthy()
  expect(screen.queryByText("Nội dung từ API")).toBeNull()
})

it("loads managed categories and independent sidebar rankings while preserving filters", async () => {
  withSidebar = true
  const router = setup("/bai-viet?type=blog&search=cáp&page=2")
  await screen.findByRole("heading", { name: "Bài được đọc nhiều" })
  expect(screen.getByRole("heading", { name: "Bài vừa xuất bản" })).toBeTruthy()
  expect(screen.getByText("1.234 lượt xem")).toBeTruthy()
  expect(calls.some(call => call.params?.type === "blog" && call.params.sort === "popular" && call.params.limit === 5)).toBe(true)
  expect(calls.some(call => call.params?.type === "blog" && call.params.sort === "newest" && call.params.limit === 3)).toBe(true)
  fireEvent.click(await screen.findByRole("link", { name: "Mẹo sử dụng" }))
  await screen.findByRole("heading", { level: 1, name: "Mẹo sử dụng" })
  const params = new URLSearchParams(router.state.location.search)
  expect(params.get("type")).toBe("blog")
  expect(params.get("search")).toBe("cáp")
  expect(params.has("page")).toBe(false)
  await waitFor(() => expect(calls.filter(call => call.params?.limit === 9).at(-1)?.params).toMatchObject({ categoryId, page: 1, search: "cáp" }))
  fireEvent.click(screen.getByRole("link", { name: "Tất cả" }))
  await waitFor(() => expect(new URLSearchParams(router.state.location.search).has("categoryId")).toBe(false))
})

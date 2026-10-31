import { beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AxiosError, AxiosHeaders } from "axios"
import { ProductNewsEditor } from "@/features/products/components/product-news-editor"
import { ProductNewsSidebar } from "@/features/storefront/components/product-news-sidebar"
import { ProductCard } from "@/features/storefront/components/product-card"
import { mapCatalogProduct } from "@/features/storefront/utils/map-catalog-product"

const state = vi.hoisted(() => {
  const articles = Array.from({ length: 6 }, (_, index) => ({ _id: String(index + 1).repeat(24), title: `Tin ${index + 1}`, slug: `tin-${index + 1}`, excerpt: 'Tóm tắt', imageUrl: null, publishedAt: null, status: 'published' }))
  return { articles, selected: { articleIds: [articles[0]._id], articles: [articles[0]], expectedVersion: 2 }, save: vi.fn(), refetch: vi.fn(), error: false, pending: false }
})
vi.mock("@/features/products/hooks/use-product-news", () => ({
  useProductNews: () => ({ data: state.selected, isPending: false, isError: state.error, refetch: state.refetch }),
  useUpdateProductNews: () => ({ mutateAsync: state.save, isPending: false }),
  usePublicProductNews: () => ({ data: state.articles.slice(0, 2), isPending: state.pending, isError: state.error, error: Error("Unavailable"), refetch: state.refetch }),
}))
vi.mock("@/features/articles/hooks/use-articles", () => ({ useArticles: () => ({ data: { data: state.articles, pagination: { totalPages: 1 } }, isPending: false, isError: false, isFetching: false }) }))
beforeEach(() => {
  state.selected = { articleIds: [state.articles[0]._id], articles: [state.articles[0]], expectedVersion: 2 }
  state.error = false; state.pending = false; state.save.mockReset(); state.refetch.mockReset()
})
it("maps checked product flags to corner badges without inventing a sale discount", () => {
  const mapped = mapCatalogProduct({ _id: "product", product_name: "Cable", slug: "cable", category: null, brand: null, price: 100, on_sale: true, is_best_seller: true, is_new: true, is_hot: true, is_home: true })
  const view = render(<MemoryRouter><ProductCard product={mapped} /></MemoryRouter>)
  for (const label of ["Bán chạy", "Mới", "Nổi bật"]) expect(screen.getByText(label)).toBeTruthy()
  expect(screen.queryByText("Đang bán")).toBeNull()
  expect(screen.queryByText("Trang chủ")).toBeNull()
  expect(mapped.discount).toBe(0)
  view.rerender(<MemoryRouter><ProductCard product={mapCatalogProduct({ _id: "product", product_name: "Cable", category: null, brand: null, price: 100, on_sale: false })} /></MemoryRouter>)
  expect(screen.queryByLabelText("Nhãn sản phẩm")).toBeNull()
  expect(screen.queryByRole("article")).toBeNull()
})
it.each([["is_home", "Trang chủ"], ["is_new", "Mới"], ["is_hot", "Nổi bật"], ["is_best_seller", "Bán chạy"]] as const)("shows only the matching home section badge for %s", (context, label) => {
  const product = mapCatalogProduct({ _id: "product", product_name: "Cable", category: null, brand: null, price: 100, on_sale: true, is_best_seller: true, is_new: true, is_hot: true, is_home: true }, context)
  expect(product.badges?.map(badge => badge.label)).toEqual([label])
  render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>)
  expect(screen.getByText(label)).toBeTruthy()
  expect(screen.queryByText("Đang bán")).toBeNull()
})
it("keeps drafts and original version during refetch/conflict until explicit reload", async () => {
  const config = { headers: new AxiosHeaders() }
  state.save.mockRejectedValue(new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, status: 409, statusText: "Conflict", headers: {}, data: { message: "Product changed", code: "VERSION_CONFLICT" } }))
  const view = render(<MemoryRouter><ProductNewsEditor id="product" /></MemoryRouter>)
  fireEvent.click(screen.getByLabelText(/Tin 2\(published\)/))
  state.selected = { ...state.selected, expectedVersion: 99 }
  state.error = true
  view.rerender(<MemoryRouter><ProductNewsEditor id="product" /></MemoryRouter>)
  expect((screen.getByLabelText(/Tin 2\(published\)/) as HTMLInputElement).checked).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Lưu tin liên quan" }))
  await waitFor(() => expect(state.save).toHaveBeenCalledWith({ id: "product", input: { articleIds: [state.articles[0]._id, state.articles[1]._id], expectedVersion: 2 } }))
  await screen.findByText("Product changed")
  expect((screen.getByRole("button", { name: "Lưu tin liên quan" }) as HTMLButtonElement).disabled).toBe(true)
  state.error = false
  state.refetch.mockResolvedValue({ data: { ...state.selected, expectedVersion: 80 } })
  fireEvent.click(screen.getByRole("button", { name: "Tải lại tin đã lưu (bỏ thay đổi)" }))
  await waitFor(() => expect((screen.getByLabelText(/Tin 2\(published\)/) as HTMLInputElement).checked).toBe(false))
  state.save.mockResolvedValue({ articleIds: [state.articles[0]._id, state.articles[1]._id], expectedVersion: 81 })
  fireEvent.click(screen.getByLabelText(/Tin 2\(published\)/))
  fireEvent.click(screen.getByRole("button", { name: "Lưu tin liên quan" }))
  await waitFor(() => expect(state.save).toHaveBeenLastCalledWith({ id: "product", input: { articleIds: [state.articles[0]._id, state.articles[1]._id], expectedVersion: 80 } }))
})
it("caps selections at five and saves the chosen display order", async () => {
  state.save.mockResolvedValue({ articleIds: [], expectedVersion: 3 })
  render(<MemoryRouter><ProductNewsEditor id="product" /></MemoryRouter>)
  for (let index = 2; index <= 5; index++) fireEvent.click(screen.getByLabelText(new RegExp(`Tin ${index}\\(published\\)`)))
  expect((screen.getByLabelText(/Tin 6\(published\)/) as HTMLInputElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Đưa tin 2 lên" }))
  fireEvent.click(screen.getByRole("button", { name: "Lưu tin liên quan" }))
  await waitFor(() => expect(state.save).toHaveBeenCalledWith({ id: "product", input: { articleIds: [state.articles[1]._id, state.articles[0]._id, ...state.articles.slice(2, 5).map(article => article._id)], expectedVersion: 2 } }))
})
it("renders linked selected news, loading and retry without blocking product content", () => {
  const view = render(<MemoryRouter><ProductNewsSidebar slug="cable" /></MemoryRouter>)
  expect(screen.getByRole("link", { name: /Tin 1/ }).getAttribute("href")).toBe("/bai-viet/tin-1")
  state.pending = true; view.rerender(<MemoryRouter><ProductNewsSidebar slug="cable" /></MemoryRouter>)
  expect(screen.getByRole("status")).toBeTruthy()
  state.pending = false; state.error = true; view.rerender(<MemoryRouter><ProductNewsSidebar slug="cable" /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Thử lại tin tức" }))
  expect(state.refetch).toHaveBeenCalled()
})

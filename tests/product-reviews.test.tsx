import { afterEach, beforeEach, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { ProductReviews } from "@/features/products/components/product-reviews"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/services/query-client"
import { useAuthStore } from "@/stores/auth.store"

const id = "a".repeat(24)
const originalAdapter = api.defaults.adapter
const review = { _id: "b".repeat(24), product: id, reviewerName: "An", comment: "Sản phẩm tốt", rating: 4, source: "dummyjson", date: "2026-10-20T00:00:00.000Z" }
const requests: { method?: string; url?: string; body?: unknown; page?: number }[] = []
let count = 1
let fail = false
beforeEach(() => {
  clearAuth(); requests.length = 0; count = 1; fail = false
  api.defaults.adapter = async config => {
    requests.push({ method: config.method, url: config.url, body: config.data ? JSON.parse(config.data) : undefined, page: config.params?.page })
    if (fail) throw new AxiosError("Denied", "ERR_BAD_REQUEST", config, undefined, { config, status: 403, statusText: "", headers: new AxiosHeaders(), data: { message: "Không thể thực hiện thao tác." } })
    if (config.method === "post") count++
    if (config.method === "delete") count--
    const data = config.url?.endsWith("/metrics") ? { data: { rating: count ? 4 : 0, reviewCount: count, soldCount: 12 } }
      : config.method === "get" ? { data: count ? [review] : [], pagination: { page: config.params.page, limit: 5, total: count, totalPages: count ? 2 : 0 } }
        : { data: review }
    return { config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data }
  }
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth() })
function setup(role: "admin" | "staff" = "admin") {
  useAuthStore.getState().setSession({ id: "self", name: "Test", firstName: "Test", lastName: "", email: "test@example.com", role, mustChangePassword: false }, { accessToken: "access" })
  render(<QueryClientProvider client={queryClient}><ProductReviews id={id} /></QueryClientProvider>)
}
function fill() {
  fireEvent.change(screen.getByLabelText("Người đánh giá"), { target: { value: "  Binh  " } })
  fireEvent.change(screen.getByLabelText("Nội dung đánh giá"), { target: { value: "  Hài lòng  " } })
}
it("shows server metrics and imported reviews and paginates on the server", async () => {
  setup("staff")
  expect(await screen.findByText("Sản phẩm tốt")).toBeTruthy()
  expect(screen.getByText("4/5")).toBeTruthy()
  expect(screen.getByText("12")).toBeTruthy()
  expect(screen.getByText(/Nhập từ DummyJSON/)).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Thêm đánh giá" })).toBeNull()
  expect(screen.queryByRole("button", { name: /Xóa đánh giá/ })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Tiếp" }))
  await waitFor(() => expect(requests.some(request => request.page === 2)).toBe(true))
  expect(requests.every(request => request.method === "get")).toBe(true)
})
it("validates review inputs then creates a review and refreshes metrics and reviews", async () => {
  setup(); await screen.findByText("Sản phẩm tốt")
  fireEvent.click(screen.getByRole("button", { name: "Thêm đánh giá" }))
  await screen.findByText("Vui lòng nhập tên người đánh giá.")
  expect(requests.some(request => request.method === "post")).toBe(false)
  fill(); fireEvent.click(screen.getByRole("button", { name: "Thêm đánh giá" }))
  await waitFor(() => expect(requests.find(request => request.method === "post")?.body).toEqual({ reviewerName: "Binh", comment: "Hài lòng", rating: 5 }))
  await waitFor(() => expect(screen.getByText("Số đánh giá").parentElement?.textContent).toContain("2"))
  expect((screen.getByLabelText("Nội dung đánh giá") as HTMLTextAreaElement).value).toBe("")
  expect(requests.filter(request => request.url?.endsWith("/metrics"))).toHaveLength(2)
})
it("keeps a review draft when the Backend rejects creation", async () => {
  setup(); await screen.findByText("Sản phẩm tốt")
  fill(); fail = true
  fireEvent.click(screen.getByRole("button", { name: "Thêm đánh giá" }))
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Không thể thực hiện thao tác.")
  expect((screen.getByLabelText("Nội dung đánh giá") as HTMLTextAreaElement).value).toBe("  Hài lòng  ")
})
it("deletes only after confirmation and refreshes the empty metrics and list", async () => {
  setup(); await screen.findByText("Sản phẩm tốt")
  fireEvent.click(screen.getByRole("button", { name: "Xóa đánh giá của An" }))
  expect(requests.some(request => request.method === "delete")).toBe(false)
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Xác nhận xóa" }))
  await screen.findByText("Chưa có đánh giá")
  expect(screen.queryByText("Sản phẩm tốt")).toBeNull()
  expect(requests.find(request => request.method === "delete")?.url).toBe(`/products/${id}/reviews/${review._id}`)
})
it("keeps the confirmation dialog open when deletion is forbidden", async () => {
  setup(); await screen.findByText("Sản phẩm tốt")
  fireEvent.click(screen.getByRole("button", { name: "Xóa đánh giá của An" })); fail = true
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Xác nhận xóa" }))
  expect(await within(screen.getByRole("dialog")).findByRole("alert")).toHaveProperty("textContent", "Không thể thực hiện thao tác.")
  expect(screen.getByText("Sản phẩm tốt")).toBeTruthy()
})

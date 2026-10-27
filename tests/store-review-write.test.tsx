import { afterEach, beforeEach, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { StoreProductReviews } from "@/features/storefront/components/store-product-feedback"
import { authApi } from "@/services/api"
import type { Product } from "@/features/products/types/products"

const product: Product = { _id: "a".repeat(24), slug: "phone", product_name: "Điện thoại mẫu", category: null, brand: null }
const originalAdapter = authApi.defaults.adapter
let failed = false
let posts: Record<string, unknown>[] = []
let client: QueryClient
beforeEach(() => {
  failed = false; posts = []
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  authApi.defaults.adapter = async config => {
    let data: unknown
    if (config.method === "post") {
      const input = JSON.parse(config.data) as Record<string, unknown>
      if (failed) throw new AxiosError("Failed", "ERR_BAD_REQUEST", config, undefined, { config, status: 409, statusText: "Conflict", headers: new AxiosHeaders(), data: { message: "Vui lòng thử lại." } })
      posts.push(input)
      data = { data: { rating: input.rating, reviewerName: input.reviewerName, comment: input.comment, source: "storefront" } }
    } else if (config.url?.endsWith("/metrics")) data = { data: { rating: posts.length ? 4 : 0, reviewCount: posts.length, soldCount: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: posts.length, 5: 0 } } }
    else { const page = config.params?.page ?? 1; expect(config.params?.limit).toBe(5); data = { data: posts.slice((page - 1) * 5, page * 5).map(post => ({ rating: post.rating, reviewerName: post.reviewerName, comment: post.comment, source: "storefront", date: "2026-10-27T00:00:00.000Z" })), pagination: { page, limit: 5, total: posts.length, totalPages: Math.ceil(posts.length / 5) } } }
    return { config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data }
  }
})
afterEach(() => { authApi.defaults.adapter = originalAdapter; client.clear() })
function setup() { render(<QueryClientProvider client={client}><StoreProductReviews product={product} /></QueryClientProvider>) }
async function openForm() {
  fireEvent.click(screen.getByRole("button", { name: "Viết đánh giá" }))
  expect(await screen.findByRole("dialog")).toBeTruthy()
  expect(screen.queryByRole("textbox", { name: "Họ tên (bắt buộc)" })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "4 sao - Tốt" }))
}
function fill() {
  fireEvent.change(screen.getByLabelText("Họ tên (bắt buộc)"), { target: { value: "  An  " } })
  fireEvent.change(screen.getByLabelText(/Đánh giá của bạn/), { target: { value: "  Sản phẩm rất tốt  " } })
}
it("opens the two-step dialog, validates required/optional fields and does not offer uploads", async () => {
  setup(); await openForm()
  fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }))
  expect(await screen.findByText("Vui lòng nhập tên người đánh giá.")).toBeTruthy()
  expect(screen.getByText("Vui lòng nhập nội dung đánh giá.")).toBeTruthy()
  fill()
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "invalid" } })
  fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }))
  expect(await screen.findByText("Email không hợp lệ.")).toBeTruthy()
  expect(posts).toHaveLength(0)
  expect(document.querySelector('input[type="file"]')).toBeNull()
})
it("saves a review, refreshes the list/rating and invalidates administrative metrics", async () => {
  client.setQueryData(["products", "metrics", product._id], { rating: 0 })
  setup(); await openForm(); fill()
  fireEvent.change(screen.getByRole("textbox", { name: "Email" }), { target: { value: "an@example.com" } })
  fireEvent.change(screen.getByRole("textbox", { name: "Số điện thoại" }), { target: { value: "0901234567" } })
  fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }))
  expect(await screen.findByText("Cảm ơn bạn! Đánh giá đã được gửi thành công.")).toBeTruthy()
  expect(await screen.findByText("Sản phẩm rất tốt")).toBeTruthy()
  expect(screen.getByText(/Người dùng gửi/)).toBeTruthy()
  expect(screen.queryByText("an@example.com")).toBeNull()
  expect(screen.queryByText("0901234567")).toBeNull()
  expect(posts[0]).toEqual({ rating: 4, reviewerName: "An", comment: "Sản phẩm rất tốt", email: "an@example.com", phone: "0901234567" })
  expect(client.getQueryState(["products", "metrics", product._id])?.isInvalidated).toBe(true)
  await waitFor(() => expect(screen.getAllByText("4.0").length).toBeGreaterThan(0))
})
it("keeps the draft after failure and allows retrying with optional contact fields blank", async () => {
  setup(); await openForm(); fill(); failed = true
  fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }))
  expect(await screen.findByRole("alert")).toBeTruthy()
  expect((screen.getByLabelText("Họ tên (bắt buộc)") as HTMLInputElement).value).toBe("  An  ")
  expect((screen.getByLabelText(/Đánh giá của bạn/) as HTMLTextAreaElement).value).toBe("  Sản phẩm rất tốt  ")
  failed = false
  fireEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }))
  expect(await screen.findByText("Cảm ơn bạn! Đánh giá đã được gửi thành công.")).toBeTruthy()
  expect(posts).toHaveLength(1)
  expect(posts[0].email).toBe("")
})
it("shows five reviews per page, global totals and star percentages, with the write button below comments", async () => {
  posts = Array.from({ length: 6 }, (_, index) => ({ rating: 4, reviewerName: `Người ${index}`, comment: `Nội dung ${index}` }))
  setup()
  const lastComment = await screen.findByText("Nội dung 4")
  expect(screen.queryByText("Nội dung 5")).toBeNull()
  expect(screen.getAllByRole("article")).toHaveLength(5)
  expect(screen.getByText("6 đánh giá")).toBeTruthy()
  expect(screen.getByRole("progressbar", { name: "4 sao" }).getAttribute("aria-valuenow")).toBe("100")
  expect(screen.getByRole("progressbar", { name: "5 sao" }).getAttribute("aria-valuenow")).toBe("0")
  expect(lastComment.compareDocumentPosition(screen.getByRole("button", { name: "Viết đánh giá" })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Trang 2" }))
  expect(await screen.findByText("Nội dung 5")).toBeTruthy()
  expect(screen.queryByText("Nội dung 4")).toBeNull()
  expect(screen.getByText("6 đánh giá")).toBeTruthy()
})

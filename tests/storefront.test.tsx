import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { expect, it, vi } from "vitest"
import type { Product } from "@/features/products/types/products"
import StorefrontProductsPage from "@/pages/storefront/products"
import StorefrontProductDetailPage from "@/pages/storefront/products/detail"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
vi.mock("@/features/categories/hooks/use-public-categories", () => ({ usePublicCategories: () => ({ data: [], isPending: false }) }))

const state = vi.hoisted(() => ({
  product: { _id: "a".repeat(24), slug: "ceramic-chicken", product_name: "Ceramic Chicken", is_active: true, category: null, brand: null, price: 100000, discount: 10, stock: 4, description: "<p>Mô tả thật</p><script>alert(1)</script>", variants: [{ _id: "b".repeat(24), sku: "BLUE", variant_name: "Màu xanh", price: 200000, stock: 2 }] } as Product,
  pending: false, error: false, relatedCount: 1, refetch: vi.fn(), list: vi.fn(),
}))
vi.mock("@/features/storefront/hooks/use-store-product-carousel", () => ({
  useStoreProductCarousel: (params: unknown) => {
    state.list(params)
    return { data: { pages: [{ data: [state.product], pagination: { total: 1 } }] }, isPending: state.pending, isError: state.error, refetch: state.refetch }
  },
}))
vi.mock("@/features/storefront/hooks/use-store-products", () => ({
  useStoreProducts: (params: unknown) => { state.list(params); return { data: { data: [state.product], pagination: { total: 1, totalPages: 1 } }, isPending: state.pending, isError: state.error, refetch: state.refetch } },
  useStoreProduct: () => ({ data: state.product, isPending: state.pending, isError: state.error, error: { statusCode: 404, message: "Not found" }, refetch: state.refetch }),
  useStoreMetrics: () => ({ data: { rating: 4.5, reviewCount: 6, soldCount: 12 }, isPending: false, isError: false }),
  useCreateStoreReview: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useStoreReviews: (_slug: string, page: number) => ({ data: { data: [{ rating: 5, reviewerName: "Khách hàng", comment: `Đánh giá trang ${page}`, source: "admin" }], pagination: { totalPages: 2 } }, isPending: false, isError: false }),
  useRelatedProducts: () => ({ data: Array.from({ length: state.relatedCount }, (_, index) => ({ ...state.product, _id: `related-${index}`, slug: index ? `related-${index}` : "related-product", product_name: index ? `Sản phẩm liên quan ${index}` : "Sản phẩm cùng danh mục" })), isPending: false, isError: false }),
}))
it("renders Backend catalog data and passes URL search/sort/page to the API hook", () => {
  render(<MemoryRouter initialEntries={["/shop?search=Chicken&sort=price-asc&page=2"]}><StorefrontProductsPage /></MemoryRouter>)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, search: "Chicken", sortBy: "price", sortOrder: "asc" }))
  expect(screen.getByRole("link", { name: "Xem Ceramic Chicken" }).getAttribute("href")).toBe("/shop/ceramic-chicken")
  expect(screen.getByText("180.000 ₫")).toBeTruthy()
})
it("renders Backend detail, updates selected variant price, and sanitizes descriptions", () => {
  const view = render(<MemoryRouter initialEntries={["/shop/ceramic-chicken"]}><Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes></MemoryRouter>)
  expect(screen.getByRole("heading", { name: "Ceramic Chicken" })).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Màu xanh" }))
  expect(screen.getByLabelText("Giá bán hiện tại").textContent).toBe("180.000 ₫")
  expect(screen.getByText("Còn 2 sản phẩm")).toBeTruthy()
  expect(view.container.querySelector("script")).toBeNull()
})
it("shows loading and request failures without falling back to fixture products", () => {
  state.pending = true
  const view = render(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  expect(screen.getByRole("status")).toBeTruthy()
  state.pending = false; state.error = true
  view.rerender(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  expect(screen.getByRole("alert")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  expect(state.refetch).toHaveBeenCalled()
  state.error = false
})
it("uses Backend products for the homepage featured section", () => {
  render(<MemoryRouter><FeaturedParts /></MemoryRouter>)
  expect(screen.getByRole("link", { name: "Xem Ceramic Chicken" })).toBeTruthy()
})
it("keeps catalog search and pagination when returning from a product detail", () => {
  render(<MemoryRouter initialEntries={["/shop?search=Chicken&page=2"]}><Routes><Route path="/shop" element={<StorefrontProductsPage />} /><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes></MemoryRouter>)
  fireEvent.click(screen.getByRole("link", { name: "Xem Ceramic Chicken" }))
  expect(screen.getByRole("link", { name: "Quay lại danh sách" }).getAttribute("href")).toBe("/shop?search=Chicken&page=2")
})
it("shows real rating/reviews, paginates reviews and links related products", () => {
  render(<MemoryRouter initialEntries={["/shop/ceramic-chicken"]}><Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes></MemoryRouter>)
  expect(screen.getAllByText("4.5").length).toBeGreaterThan(0)
  expect(screen.getAllByText("Đã bán 12").length).toBeGreaterThan(0)
  expect(screen.getByText("Đánh giá trang 1")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Trang 2" }))
  expect(screen.getByText("Đánh giá trang 2")).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Các sản phẩm liên quan" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Xem Sản phẩm cùng danh mục" }).getAttribute("href")).toBe("/shop/related-product")
  fireEvent.click(screen.getByRole("tab", { name: "Thông tin chi tiết" }))
  expect(screen.getByRole("tab", { name: "Thông tin chi tiết" }).getAttribute("aria-selected")).toBe("true")
})
it("groups category labels and policies inside the overview, without duplicated policy rows or a news sidebar", () => {
  const original = state.product
  state.product = { ...original, category: { _id: "d".repeat(24), name: "Tai nghe" }, tags: ["Bluetooth"], shippingInformation: "Giao trong 3 ngày", variants: original.variants?.map(variant => ({ ...variant, attributes: { material: "Cotton" } })) }
  try {
    render(<MemoryRouter initialEntries={["/shop/ceramic-chicken"]}><Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes></MemoryRouter>)
    const categories = screen.getByRole("navigation", { name: "Danh mục sản phẩm" })
    expect(within(categories).queryByText("Bluetooth")).toBeNull()
    expect(within(screen.getByRole("tabpanel", { name: "Mô tả sản phẩm" })).getByText("Bluetooth")).toBeTruthy()
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" })
    expect(within(breadcrumb).getByRole("link", { name: "Trang chủ" })).toBeTruthy()
    expect(within(breadcrumb).getByRole("link", { name: "Tai nghe" }).getAttribute("href")).toBe(`/shop?category=${"d".repeat(24)}`)
    expect(within(breadcrumb).getByText("Ceramic Chicken").getAttribute("aria-current")).toBe("page")
    expect(within(categories).getByRole("link", { name: "Tai nghe" }).getAttribute("href")).toBe(`/shop?category=${"d".repeat(24)}`)
    const overview = screen.getByRole("region", { name: "Tổng quan sản phẩm" })
    expect(within(overview).getByRole("navigation", { name: "Danh mục sản phẩm" })).toBe(categories)
    expect(within(overview).getByText("Giao trong 3 ngày")).toBeTruthy()
    expect(within(overview).getByText("Bảo hành")).toBeTruthy()
    expect(within(overview).getByText("Đổi trả")).toBeTruthy()
    fireEvent.click(screen.getByRole("tab", { name: "Thông tin chi tiết" }))
    const table = screen.getByRole("table", { name: "Thông tin chi tiết sản phẩm" })
    expect(within(table).getByRole("rowheader", { name: "SKU" })).toBeTruthy()
    expect(within(table).getByRole("cell", { name: "BLUE" })).toBeTruthy()
    expect(within(table).getByRole("rowheader", { name: "Material" })).toBeTruthy()
    for (const name of ["Giao hàng", "Bảo hành", "Đổi trả"]) expect(within(table).queryByRole("rowheader", { name })).toBeNull()
    expect(screen.queryByRole("complementary", { name: "Tin tức liên quan" })).toBeNull()
  } finally { state.product = original }
})
it("limits the related product section to five cards", () => {
  state.relatedCount = 7
  try {
    render(<MemoryRouter initialEntries={["/shop/ceramic-chicken"]}><Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes></MemoryRouter>)
    const related = screen.getByRole("region", { name: "Các sản phẩm liên quan" })
    expect(within(related).getAllByRole("article")).toHaveLength(5)
    expect(within(related).queryByText("Sản phẩm liên quan 5")).toBeNull()
  } finally { state.relatedCount = 1 }
})

it("shows discounted price, struck-through original and actual discount on product cards", () => {
  render(<MemoryRouter><FeaturedParts /></MemoryRouter>)
  const card = screen.getByRole("article")
  expect(within(card).getByLabelText("Giá bán").textContent).toContain("180.000")
  const original = within(card).getByLabelText("Giá gốc")
  expect(original.tagName).toBe("DEL")
  expect(original.textContent).toContain("200.000")
  expect(within(card).getByText("-10%")).toBeTruthy()
  expect(screen.queryByText("Khám phá cửa hàng")).toBeNull()
  expect(screen.queryByRole("button", { name: "Tất cả" })).toBeNull()
  expect(screen.queryByRole("link", { name: "Đến danh sách sản phẩm" })).toBeNull()
})
it("does not invent an original price or discount badge for non-discounted products", () => {
  const original = state.product
  state.product = { ...original, discount: 0 }
  try {
    render(<MemoryRouter><FeaturedParts /></MemoryRouter>)
    expect(screen.queryByLabelText("Giá gốc")).toBeNull()
    expect(screen.queryByText("-0%")).toBeNull()
  } finally { state.product = original }
})

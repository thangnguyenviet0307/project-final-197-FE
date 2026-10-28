import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { expect, it, vi } from "vitest"
import type { Product } from "@/features/products/types/products"
import StorefrontProductsPage from "@/pages/storefront/products"
import StorefrontProductDetailPage from "@/pages/storefront/products/detail"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
vi.mock("@/features/categories/hooks/use-public-categories", () => ({ usePublicCategories: () => ({ data: [{ _id: "d".repeat(24), name: "Tai nghe", slug: "tai-nghe" }, { _id: "f".repeat(24), name: "Cáp sạc", slug: "cap-sac" }], isPending: false }) }))

const state = vi.hoisted(() => ({
  product: { _id: "a".repeat(24), slug: "ceramic-chicken", product_name: "Ceramic Chicken", is_active: true, category: null, brand: null, price: 100000, discount: 10, stock: 4, description: "<p>Mô tả thật</p><script>alert(1)</script>", variants: [{ _id: "b".repeat(24), sku: "BLUE", variant_name: "Màu xanh", price: 200000, stock: 2 }] } as Product,
  pending: false, error: false, relatedCount: 1, refetch: vi.fn(), list: vi.fn(), count: vi.fn(),
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

vi.mock("@/features/brands/hooks/use-public-brands", () => ({ usePublicBrands: () => ({ data: [{ _id: "c".repeat(24), name: "Baseus", slug: "baseus", logoUrl: "https://images.test/baseus.svg" }, { _id: "e".repeat(24), name: "Apple", slug: "apple" }], isPending: false, isError: false, refetch: vi.fn() }) }))


vi.mock("@/features/storefront/hooks/use-store-filter-count", () => ({ useStoreFilterCount: (params: { brand?: string }, enabled: boolean) => {
  state.count(params, enabled)
  return { data: params.brand ? 7 : 23, isFetching: false, isError: false }
} }))
it("shows only the filter trigger and previews draft results before applying presets", () => {
  state.list.mockClear()
  render(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  const filters = screen.getByRole("region", { name: "Lọc và sắp xếp sản phẩm" })
  expect(within(filters).getAllByRole("button")).toHaveLength(1)
  expect(screen.queryByRole("combobox")).toBeNull()
  expect(screen.queryByLabelText("Lọc nhanh theo thương hiệu")).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Lọc" }))
  const dialog = screen.getByRole("dialog")
  expect(within(dialog).queryByRole("spinbutton")).toBeNull()
  expect(within(dialog).getByRole("button", { name: "Xem 23 kết quả" })).toBeTruthy()
  fireEvent.click(within(dialog).getByRole("button", { name: "Baseus" }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Tai nghe" }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Từ 2 - 4 triệu" }))
  expect(state.count).toHaveBeenLastCalledWith(expect.objectContaining({ brand: "c".repeat(24), category: "d".repeat(24), minPrice: 2000000, maxPrice: 4000000 }), true)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ brand: undefined, category: undefined }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Xem 7 kết quả" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, brand: "c".repeat(24), category: "d".repeat(24), minPrice: 2000000, maxPrice: 4000000 }))
})
it("clears only the draft and applies it after confirmation", () => {
  render(<MemoryRouter initialEntries={["/shop?search=Chicken&sort=price-desc&page=2&brand=cccccccccccccccccccccccc&minPrice=2000000&maxPrice=4000000"]}><StorefrontProductsPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Lọc" }))
  const dialog = screen.getByRole("dialog")
  fireEvent.click(within(dialog).getByRole("button", { name: "Bỏ chọn" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, brand: "c".repeat(24) }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Xem 23 kết quả" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, search: "Chicken", sortBy: "price", sortOrder: "desc", brand: undefined, minPrice: undefined, maxPrice: undefined }))
})
it("uses inline server sorting and toggles the price direction", () => {
  render(<MemoryRouter initialEntries={["/shop?page=2&brand=cccccccccccccccccccccccc"]}><StorefrontProductsPage /></MemoryRouter>)
  const sort = screen.getByRole("navigation", { name: "Sắp xếp sản phẩm" })
  expect(within(sort).getByRole("button", { name: "Nổi bật" }).getAttribute("aria-pressed")).toBe("true")
  for (const [name, sortBy] of [["Mới", "createdAt"], ["Bán chạy", "is_best_seller"], ["% giảm giá", "discount"], ["Nổi bật", "is_hot"]]) {
    fireEvent.click(within(sort).getByRole("button", { name }))
    expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, sortBy, sortOrder: "desc", brand: "c".repeat(24) }))
  }
  fireEvent.click(within(sort).getByRole("button", { name: "Giá tăng hoặc giảm" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ sortBy: "price", sortOrder: "asc" }))
  fireEvent.click(within(sort).getByRole("button", { name: "Giá tăng dần" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ sortBy: "price", sortOrder: "desc" }))
})

it("shows API Apple and removable draft selections above brands without applying on close", () => {
  render(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Lọc" }))
  const dialog = screen.getByRole("dialog")
  expect(within(dialog).getByRole("button", { name: "Apple" })).toBeTruthy()
  fireEvent.click(within(dialog).getByRole("button", { name: "Baseus" }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Tai nghe" }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Dưới 2 triệu" }))
  const selected = within(dialog).getByLabelText("Các bộ lọc đã chọn")
  expect(within(selected).getByRole("button", { name: "Bỏ Baseus" })).toBeTruthy()
  expect(within(selected).getByRole("button", { name: "Bỏ Tai nghe" })).toBeTruthy()
  fireEvent.click(within(selected).getByRole("button", { name: "Bỏ Dưới 2 triệu" }))
  expect(state.count).toHaveBeenLastCalledWith(expect.objectContaining({ brand: "c".repeat(24), category: "d".repeat(24), minPrice: undefined, maxPrice: undefined }), true)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ brand: undefined, category: undefined }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Đóng bộ lọc" }))
  const filters = screen.getByRole("region", { name: "Lọc và sắp xếp sản phẩm" })
  expect(within(filters).queryByLabelText("Các bộ lọc đã chọn")).toBeNull()
})
it("shows applied chips outside and clears one or all while preserving search and sorting", () => {
  render(<MemoryRouter initialEntries={[`/shop?search=cable&sort=price-desc&page=2&brand=${"c".repeat(24)}&category=${"d".repeat(24)}&maxPrice=2000000`]}><StorefrontProductsPage /></MemoryRouter>)
  const filters = screen.getByRole("region", { name: "Lọc và sắp xếp sản phẩm" })
  fireEvent.click(within(filters).getByRole("button", { name: "Bỏ Baseus" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ brand: undefined, category: "d".repeat(24), maxPrice: 2000000, page: 1, search: "cable", sortBy: "price", sortOrder: "desc" }))
  fireEvent.click(within(filters).getByRole("button", { name: "Xóa tất cả" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ brand: undefined, category: undefined, minPrice: undefined, maxPrice: undefined, search: "cable", sortOrder: "desc" }))
  expect(within(filters).queryByLabelText("Các bộ lọc đã chọn")).toBeNull()
})

it("applies multiple brands and categories and removes only the selected chip", () => {
  render(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Lọc" }))
  const dialog = screen.getByRole("dialog")
  for (const name of ["Baseus", "Apple", "Tai nghe", "Cáp sạc", "Dưới 2 triệu", "Từ 2 - 4 triệu"]) {
    fireEvent.click(within(dialog).getByRole("button", { name }))
  }
  expect(state.count).toHaveBeenLastCalledWith(expect.objectContaining({
    brand: ["c".repeat(24), "e".repeat(24)].join(","),
    category: ["d".repeat(24), "f".repeat(24)].join(","), minPrice: 2000000, maxPrice: 4000000,
  }), true)
  expect(within(dialog).getByRole("button", { name: "Dưới 2 triệu" }).getAttribute("aria-pressed")).toBe("false")
  fireEvent.click(within(dialog).getByRole("button", { name: "Xem 7 kết quả" }))
  const filters = screen.getByRole("region", { name: "Lọc và sắp xếp sản phẩm" })
  expect(within(filters).getByRole("button", { name: "Bỏ Apple" })).toBeTruthy()
  expect(within(filters).getByRole("button", { name: "Bỏ Cáp sạc" })).toBeTruthy()
  fireEvent.click(within(filters).getByRole("button", { name: "Bỏ Baseus" }))
  fireEvent.click(within(filters).getByRole("button", { name: "Bỏ Tai nghe" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({
    brand: "e".repeat(24), category: "f".repeat(24), minPrice: 2000000, maxPrice: 4000000,
  }))
})

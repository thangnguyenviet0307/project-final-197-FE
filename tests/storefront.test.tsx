import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { expect, it, vi } from "vitest"
import type { Product } from "@/features/products/types/products"
import StorefrontProductsPage from "@/pages/storefront/products"
import StorefrontProductDetailPage from "@/pages/storefront/products/detail"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { StorefrontNewsSection } from "@/features/storefront/components/storefront-news-section"
import { BlogSection } from "@/pages/public/landing/components/blog-section"
import StorefrontArticleDetailPage from "@/pages/storefront/articles/detail"
vi.mock("@/features/categories/hooks/use-public-categories", () => ({
  usePublicCategories: () => ({ data: [{ _id: "d".repeat(24), name: "Tai nghe", slug: "tai-nghe" }], isPending: false, isError: false, refetch: vi.fn() }),
}))
vi.mock("@/features/brands/hooks/use-public-brands", () => ({
  usePublicBrands: () => ({ data: [{ _id: "c".repeat(24), name: "Baseus", slug: "baseus", logoUrl: "https://images.test/baseus.svg" }], isPending: false, isError: false, refetch: vi.fn() }),
}))
vi.mock("@/features/storefront/services/catalog.service", () => ({
  getStoreMetrics: vi.fn(async () => ({ rating: 4.5, reviewCount: 6, soldCount: 12 })),
}))

const state = vi.hoisted(() => ({
  product: { _id: "a".repeat(24), slug: "ceramic-chicken", product_name: "Ceramic Chicken", is_active: true, category: null, brand: null, price: 100000, discount: 10, stock: 4, description: "<p>Mô tả thật</p><script>alert(1)</script>", variants: [{ _id: "b".repeat(24), sku: "BLUE", variant_name: "Màu xanh", price: 200000, stock: 2 }] } as Product,
  pending: false, error: false, relatedCount: 1, refetch: vi.fn(), list: vi.fn(),
  articles: [{ _id: "article-1", type: "news" as const, title: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối", slug: "chon-cap-sac", category: "Cẩm nang chọn mua", excerpt: "Kiểm tra thiết bị trước khi chọn cáp.", content: "Nội dung bài viết", imageUrl: null, tags: ["cáp sạc"], authorName: "Ban biên tập", publishedAt: "2026-10-28T10:00:00.000Z", isFeatured: false, viewCount: 0, seo: {} }],
  articlesPending: false, articlesError: false, articlesRefetch: vi.fn(),
  article: { _id: "article-1", type: "blog" as const, title: "Bài viết mẫu", slug: "bai-viet-mau", category: "Kinh nghiệm", excerpt: "Tóm tắt bài viết.", content: "Dòng nội dung an toàn.\n<script>alert(1)</script>", imageUrl: null, tags: ["blog"], authorName: "Ban biên tập", publishedAt: "2026-10-28T10:00:00.000Z", isFeatured: false, viewCount: 0, seo: {} },
}))
vi.mock("@/features/storefront/hooks/use-public-articles", () => ({
  usePublicArticles: (type: "news" | "blog") => ({
    data: {
      data: type === "blog" ? [{ ...state.article, type }] : state.articles.map((article) => ({ ...article, type })),
      pagination: { page: 1, limit: 3, total: type === "blog" ? 1 : state.articles.length, totalPages: 1 },
    },
    isPending: state.articlesPending,
    isError: state.articlesError,
    error: new Error("Backend unavailable"),
    refetch: state.articlesRefetch,
  }),
  usePublicArticle: () => ({
    data: state.article,
    isPending: state.articlesPending,
    isError: state.articlesError,
    error: new Error("Backend unavailable"),
    refetch: state.articlesRefetch,
  }),
}))
vi.mock("@/features/storefront/hooks/use-store-products", () => ({
  useStoreProducts: (params: unknown) => { state.list(params); return { data: { data: [state.product], pagination: { total: 1, totalPages: 1 } }, isPending: state.pending, isError: state.error, refetch: state.refetch } },
  useStoreProduct: () => ({ data: state.product, isPending: state.pending, isError: state.error, error: { statusCode: 404, message: "Not found" }, refetch: state.refetch }),
  useStoreMetrics: () => ({ data: { rating: 4.5, reviewCount: 6, soldCount: 12 }, isPending: false, isError: false }),
  useCreateStoreReview: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useStoreReviews: (_slug: string, page: number) => ({ data: { data: [{ rating: 5, reviewerName: "Khách hàng", comment: `Đánh giá trang ${page}`, source: "admin" }], pagination: { totalPages: 2 } }, isPending: false, isError: false }),
  useRelatedProducts: () => ({ data: Array.from({ length: state.relatedCount }, (_, index) => ({ ...state.product, _id: `related-${index}`, slug: index ? `related-${index}` : "related-product", product_name: index ? `Sản phẩm liên quan ${index}` : "Sản phẩm cùng danh mục" })), isPending: false, isError: false }),
}))
function renderFeaturedParts() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}><MemoryRouter><FeaturedParts /></MemoryRouter></QueryClientProvider>)
}
it("renders Backend catalog data and passes URL search/sort/page to the API hook", () => {
  render(<MemoryRouter initialEntries={["/shop?search=Chicken&sort=price-asc&page=2"]}><StorefrontProductsPage /></MemoryRouter>)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, search: "Chicken", sortBy: "price", sortOrder: "asc" }))
  expect(screen.getByRole("link", { name: "Xem Ceramic Chicken" }).getAttribute("href")).toBe("/shop/ceramic-chicken")
  expect(screen.getByText("180.000 ₫")).toBeTruthy()
})
it("filters the complete catalog by brand, category and price without a local search field", () => {
  state.list.mockClear()
  render(<MemoryRouter><StorefrontProductsPage /></MemoryRouter>)
  expect(screen.queryByPlaceholderText("Tên sản phẩm…")).toBeNull()
  expect(screen.getByRole("combobox", { name: /Sắp xếp theo/ })).toBeTruthy()
  const quickBrands = screen.getByLabelText("Lọc nhanh theo thương hiệu")
  expect(within(quickBrands).getByRole("button", { name: "Baseus" }).querySelector("img")?.getAttribute("src")).toBe("https://images.test/baseus.svg")
  fireEvent.click(screen.getByRole("button", { name: /^Lọc/ }))
  const dialog = screen.getByRole("dialog")
  fireEvent.click(within(dialog).getByRole("button", { name: "Baseus" }))
  fireEvent.click(within(dialog).getByRole("button", { name: "Tai nghe" }))
  fireEvent.change(within(dialog).getByLabelText("Giá từ (₫)"), { target: { value: "100000" } })
  fireEvent.change(within(dialog).getByLabelText("Giá đến (₫)"), { target: { value: "500000" } })
  fireEvent.click(within(dialog).getByRole("button", { name: /^Xem/ }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({
    page: 1,
    brand: "c".repeat(24),
    category: "d".repeat(24),
    minPrice: 100000,
    maxPrice: 500000,
  }))
})
it("rejects an invalid price range and can clear applied filters", async () => {
  state.list.mockClear()
  render(<MemoryRouter initialEntries={["/shop?brand=cccccccccccccccccccccccc&minPrice=200000&maxPrice=50000"]}><StorefrontProductsPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: /^Lọc/ }))
  const dialog = screen.getByRole("dialog")
  fireEvent.click(within(dialog).getByRole("button", { name: /^Xem/ }))
  expect(within(dialog).getByRole("alert").textContent).toContain("Giá tối thiểu không thể lớn hơn giá tối đa.")
  fireEvent.click(within(dialog).getByRole("button", { name: /Xóa bộ lọc/ }))
  await waitFor(() => {
    expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    }))
  })
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
it("renders Vietnamese featured product tabs and database-backed products", async () => {
  renderFeaturedParts()
  expect(screen.getByRole("heading", { name: "Sản phẩm nổi bật" })).toBeTruthy()
  const tabs = screen.getByRole("tablist", { name: "Danh mục sản phẩm nổi bật" })
  expect(within(tabs).getByRole("tab", { name: "Sản phẩm khuyến mãi" }).getAttribute("aria-selected")).toBe("true")
  expect(within(tabs).getByRole("tab", { name: "Sản phẩm bán chạy" })).toBeTruthy()
  expect(within(tabs).getByRole("tab", { name: "Sản phẩm đánh giá cao" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Xem Ceramic Chicken" })).toBeTruthy()
  fireEvent.click(within(tabs).getByRole("tab", { name: "Sản phẩm bán chạy" }))
  expect(within(tabs).getByRole("tab", { name: "Sản phẩm bán chạy" }).getAttribute("aria-selected")).toBe("true")
  expect(await screen.findByRole("tabpanel", { name: "Sản phẩm bán chạy" })).toBeTruthy()
})
it("keeps regular catalog products in the Sale Products collection without a discount badge", () => {
  const original = state.product
  state.product = { ...original, discount: 0 }
  try {
    renderFeaturedParts()
    expect(screen.getByRole("link", { name: "Xem Ceramic Chicken" })).toBeTruthy()
    expect(screen.queryByText("-0%")).toBeNull()
  } finally {
    state.product = original
  }
})
it("renders Backend news cards and links to the article detail page", () => {
  render(<MemoryRouter><StorefrontNewsSection /></MemoryRouter>)
  expect(screen.getByRole("region", { name: "Tin tức và cẩm nang phụ kiện" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Tin tức và mẹo sử dụng phụ kiện" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Đọc bài viết" }).getAttribute("href")).toBe("/bai-viet/chon-cap-sac")
})
it("shows news loading, empty and request error states with retry", () => {
  state.articlesPending = true
  const view = render(<MemoryRouter><StorefrontNewsSection /></MemoryRouter>)
  expect(screen.getByRole("status").textContent).toContain("Đang tải tin tức")
  state.articlesPending = false
  state.articlesError = true
  view.rerender(<MemoryRouter><StorefrontNewsSection /></MemoryRouter>)
  expect(screen.getByRole("alert").textContent).toContain("Backend unavailable")
  fireEvent.click(screen.getByRole("button", { name: "Thử tải lại" }))
  expect(state.articlesRefetch).toHaveBeenCalled()
  state.articlesError = false
  state.articles = []
  view.rerender(<MemoryRouter><StorefrontNewsSection /></MemoryRouter>)
  expect(screen.getByText("Chưa có tin tức được xuất bản.")).toBeTruthy()
  state.articles = [{ _id: "article-1", type: "news", title: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối", slug: "chon-cap-sac", category: "Cẩm nang chọn mua", excerpt: "Kiểm tra thiết bị trước khi chọn cáp.", content: "Nội dung bài viết", imageUrl: null, tags: ["cáp sạc"], authorName: "Ban biên tập", publishedAt: "2026-10-28T10:00:00.000Z", isFeatured: false, viewCount: 0, seo: {} }]
})
it("renders live blog cards and a safe article detail page", () => {
  render(<MemoryRouter><BlogSection /></MemoryRouter>)
  expect(screen.getByText("Bài viết mẫu")).toBeTruthy()
  expect(screen.getByRole("link", { name: "Tìm hiểu thêm" }).getAttribute("href")).toBe("/bai-viet/bai-viet-mau")

  const detail = render(<MemoryRouter initialEntries={["/bai-viet/bai-viet-mau"]}><Routes><Route path="/bai-viet/:slug" element={<StorefrontArticleDetailPage />} /></Routes></MemoryRouter>)
  expect(screen.getByRole("heading", { name: "Bài viết mẫu" })).toBeTruthy()
  expect(detail.container.querySelector("script")).toBeNull()
  expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeTruthy()
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

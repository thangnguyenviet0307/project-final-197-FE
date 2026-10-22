import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { expect, it } from "vitest"
import StorefrontHomePage from "@/pages/storefront/home"
import StorefrontProductsPage from "@/pages/storefront/products"
import StorefrontProductDetailPage from "@/pages/storefront/products/detail"

it("renders the storefront homepage sections", () => {
  render(<MemoryRouter><StorefrontHomePage /></MemoryRouter>)

  expect(screen.getByRole("heading", { name: /Công nghệ hay/ })).toBeTruthy()
  expect(screen.getByRole("navigation", { name: "Danh mục nhanh" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm tuyển chọn" })).toBeTruthy()
  expect(screen.getByRole("tab", { name: "Sản phẩm ưu đãi" })).toBeTruthy()
  expect(screen.getByRole("tab", { name: "Bán chạy nhất" })).toBeTruthy()
  expect(screen.getByRole("tab", { name: "Đánh giá cao" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm nổi bật" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm được đánh giá cao" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm bán chạy" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Khách hàng nói về chúng tôi" })).toBeTruthy()
  fireEvent.click(screen.getByRole("tab", { name: "Bán chạy nhất" }))
  expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe("featured-tab-bestseller")
  fireEvent.click(screen.getByRole("button", { name: "Banner tiếp theo" }))
  expect(screen.getByRole("heading", { name: /Nghe rõ từng nhịp/ })).toBeTruthy()
})

it("filters and sorts the product listing from URL parameters", () => {
  render(
    <MemoryRouter initialEntries={[`/shop?category=${encodeURIComponent("Âm thanh")}&sort=price-asc`]}>
      <Routes><Route path="/shop" element={<StorefrontProductsPage />} /></Routes>
    </MemoryRouter>,
  )

  expect(screen.getByText("3")).toBeTruthy()
  expect(screen.getByRole("link", { name: "Tai nghe không dây Comfort" })).toBeTruthy()
  expect(screen.queryByRole("link", { name: "Máy ảnh Mirrorless Compact" })).toBeNull()
})

it("shows product gallery, selectable variants, content tabs, and related products", () => {
  render(
    <MemoryRouter initialEntries={["/shop/tai-nghe-chup-tai-studio"]}>
      <Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes>
    </MemoryRouter>,
  )

  expect(screen.getByRole("heading", { name: "Tai nghe chụp tai Studio" })).toBeTruthy()
  const silverVariant = screen.getByRole("button", { name: /Bạc/ })
  fireEvent.click(silverVariant)
  expect(silverVariant.getAttribute("aria-pressed")).toBe("true")
  fireEvent.click(screen.getByRole("button", { name: "Thông tin nổi bật" }))
  expect(screen.getByText("Âm thanh cân bằng, rõ nét")).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm liên quan" })).toBeTruthy()
})

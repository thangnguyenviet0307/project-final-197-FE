import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { expect, it } from "vitest"
import StorefrontHomePage from "@/pages/storefront/home"
import StorefrontProductsPage from "@/pages/storefront/products"
import StorefrontProductDetailPage from "@/pages/storefront/products/detail"
import { storefrontCategories, storefrontProducts } from "@/features/storefront/data/products"
import { sourceProductListings } from "@/features/storefront/data/source-product-listings"
import { StoreDepartmentsMenu } from "@/layout/storefront/store-departments-menu"

it("renders the storefront homepage sections", () => {
  render(<MemoryRouter><StorefrontHomePage /></MemoryRouter>)

  expect(screen.getAllByRole("heading", { name: /Dây cáp sạc/ }).length).toBeGreaterThan(0)
  expect(screen.getByRole("navigation", { name: "Danh mục nhanh" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Chọn phụ kiện theo nhu cầu" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Cách chọn đúng phụ kiện" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Thông tin hữu ích cho phụ kiện bạn chọn" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Chọn cáp sạc phù hợp: bắt đầu từ cổng kết nối" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Tai nghe có dây hay Bluetooth: đâu là lựa chọn của bạn?" })).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Ba điều cần kiểm tra trước khi mua kính cường lực" })).toBeTruthy()
  for (const category of storefrontCategories) {
    expect(screen.getByRole("heading", { name: category.name })).toBeTruthy()
    expect(screen.getAllByText(category.description).length).toBeGreaterThan(0)
  }
  expect(screen.getAllByRole("link", { name: /Bộ sưu tập/ })).toHaveLength(storefrontCategories.length)
  fireEvent.click(screen.getByRole("button", { name: "Banner tiếp theo" }))
  expect(screen.getAllByRole("heading", { name: /Tai nghe/ }).length).toBeGreaterThan(0)
})

it("filters and sorts the product listing from URL parameters", () => {
  render(
    <MemoryRouter initialEntries={[`/shop?category=${encodeURIComponent("Loa Bluetooth")}&sort=price-asc`]}>
      <Routes><Route path="/shop" element={<StorefrontProductsPage />} /></Routes>
    </MemoryRouter>,
  )

  const speakerCount = storefrontProducts.filter((product) => product.category === "Loa Bluetooth").length
  expect(screen.getByRole("heading", { name: "Loa Bluetooth" })).toBeTruthy()
  expect(screen.getByText(String(speakerCount))).toBeTruthy()
  expect(screen.getByRole("link", { name: "Loa Bluetooth Hoco HC46" })).toBeTruthy()
  expect(screen.queryByRole("link", { name: "Tai Nghe Bluetooth TWS Hoco EW94" })).toBeNull()
})

it("uses only source images and has at least 10 and at most 15 products in each category", () => {
  expect(sourceProductListings).toHaveLength(60)
  expect(storefrontCategories.map((category) => category.name)).toEqual([
    "Dây cáp sạc", "Tai nghe", "Pin sạc dự phòng", "Phụ kiện máy tính", "Loa Bluetooth", "Kính cường lực",
  ])
  for (const category of storefrontCategories) {
    const products = storefrontProducts.filter((product) => product.category === category.name)
    expect(products.length).toBeGreaterThanOrEqual(10)
    expect(products.length).toBeLessThanOrEqual(15)
    expect(products.every((product) => product.sourceUrl?.startsWith("https://phukiengiaxuong.com.vn/"))).toBe(true)
    expect(products.every((product) => product.image.startsWith("https://phukiengiaxuong.com.vn/cdn/images/"))).toBe(true)
  }
  expect(storefrontProducts.every((product) => product.price > 0)).toBe(true)
  expect(storefrontProducts.every((product) => !("rating" in product) && !("reviewCount" in product))).toBe(true)
})

it("shows real storefront categories and products inside the all-categories menu", () => {
  render(<MemoryRouter><StoreDepartmentsMenu /></MemoryRouter>)

  fireEvent.click(screen.getByRole("button", { name: "TẤT CẢ DANH MỤC" }))
  for (const category of storefrontCategories) {
    expect(screen.getByRole("button", { name: `Mở danh mục ${category.name}` })).toBeTruthy()
  }

  fireEvent.click(screen.getByRole("button", { name: "Mở danh mục Loa Bluetooth" }))
  expect(screen.getByRole("link", { name: /Loa Bluetooth Hoco HC46/ })).toBeTruthy()
  expect(screen.getByRole("link", { name: /Xem tất cả 10 sản phẩm/ })).toBeTruthy()

  fireEvent.click(screen.getByRole("button", { name: `Tất cả sản phẩm (${storefrontProducts.length})` }))
  const allProductsPanel = screen.getByRole("region", { name: "Tất cả sản phẩm" })
  expect(within(allProductsPanel).getAllByRole("link")).toHaveLength(storefrontProducts.length)
  expect(within(allProductsPanel).getByRole("link", { name: new RegExp(storefrontProducts[0].name) })).toBeTruthy()
  expect(allProductsPanel.querySelectorAll("img")).toHaveLength(storefrontProducts.length)
  expect(within(allProductsPanel).queryByText(/Giá sỉ|Giá CK|tham khảo/i)).toBeNull()
})

it("shows product gallery, selectable variants, content tabs, and related products", () => {
  render(
    <MemoryRouter initialEntries={["/shop/tai-nghe-bluetooth-tws-hoco-ew94"]}>
      <Routes><Route path="/shop/:slug" element={<StorefrontProductDetailPage />} /></Routes>
    </MemoryRouter>,
  )

  expect(screen.getByRole("heading", { name: "Tai Nghe Bluetooth TWS Hoco EW94" })).toBeTruthy()
  expect(screen.queryByRole("link", { name: /Kiểm tra giá và thông tin mới nhất/ })).toBeNull()
  const standardVariant = screen.getByRole("button", { name: /Mẫu tiêu chuẩn/ })
  fireEvent.click(standardVariant)
  expect(standardVariant.getAttribute("aria-pressed")).toBe("true")
  fireEvent.click(screen.getByRole("button", { name: "Thông tin nổi bật" }))
  expect(screen.getByText("Bluetooth 6.0, chip JL AC7103")).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Sản phẩm liên quan" })).toBeTruthy()
})

import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { expect, it } from "vitest"
import { AdminStoreProductLink } from "@/features/storefront/components/admin-store-product-link"
it("links an active Backend product directly to its store detail respecting basename", () => {
  render(<MemoryRouter basename="/app" initialEntries={["/app/products"]}><AdminStoreProductLink product={{ slug: "ceramic-chicken", is_active: true }} /></MemoryRouter>)
  const link = screen.getByRole("link", { name: "Xem trên cửa hàng" })
  expect(link.getAttribute("href")).toBe("/app/shop/ceramic-chicken")
  expect(link.getAttribute("target")).toBe("_blank")
  expect(link.getAttribute("rel")).toBe("noopener noreferrer")
})
it("does not link an inactive product to a public detail", () => {
  render(<AdminStoreProductLink product={{ slug: "hidden", is_active: false }} />)
  expect(screen.queryByRole("link")).toBeNull()
  expect(screen.getByText("Sản phẩm chưa được hiển thị trên cửa hàng.")).toBeTruthy()
})

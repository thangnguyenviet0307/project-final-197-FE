import { beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import StorefrontLayout from "@/layout/storefront/storefront-layout"
import Home from "@/pages/storefront/homepage"
import Shop from "@/pages/storefront/shop"
import Cart from "@/pages/storefront/cart"
import Wishlist from "@/pages/storefront/wishlist"
import { useStorefront } from "@/features/storefront/store"
import { products } from "@/features/storefront/catalog"

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  useStorefront.setState({ cart: {}, wishlist: [] })
})

function setup(path = "/") {
  const router = createMemoryRouter([{
    element: <StorefrontLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/shop", element: <Shop /> },
      { path: "/cart", element: <Cart /> },
      { path: "/wishlist", element: <Wishlist /> },
    ],
  }], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

it("keeps the same shared header and footer when the page body changes", async () => {
  setup()
  const header = screen.getByRole("banner")
  const footer = screen.getByRole("contentinfo")
  fireEvent.click(screen.getByRole("link", { name: "Sản phẩm" }))
  expect(await screen.findByRole("heading", { name: "Tất cả sản phẩm", level: 1 })).toBeTruthy()
  expect(screen.getByRole("banner")).toBe(header)
  expect(screen.getByRole("contentinfo")).toBe(footer)
})

it("searches from the shared header and renders an empty result for unknown products", async () => {
  const router = setup()
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm kiếm sản phẩm" }), { target: { value: "no-such-device" } })
  fireEvent.click(screen.getByRole("button", { name: "Tìm kiếm" }))
  expect(await screen.findByRole("heading", { name: "Chưa tìm thấy sản phẩm" })).toBeTruthy()
  expect(router.state.location.search).toContain("q=no-such-device")
})

it("adds products, updates quantity, and removes the final cart item", async () => {
  setup("/shop")
  fireEvent.click(screen.getByRole("button", { name: `Thêm ${products[0].name} vào giỏ` }))
  fireEvent.click(within(screen.getByRole("banner")).getByRole("link", { name: /Giỏ hàng/ }))
  const quantity = await screen.findByRole("spinbutton", { name: `Số lượng ${products[0].name}` })
  fireEvent.change(quantity, { target: { value: "3" } })
  expect(useStorefront.getState().cart[products[0].slug]).toBe(3)
  fireEvent.click(screen.getByRole("button", { name: `Xóa ${products[0].name}` }))
  expect(screen.getByRole("heading", { name: "Giỏ hàng đang chờ bạn" })).toBeTruthy()
})

it("filters the wishlist and removes a saved product", () => {
  useStorefront.setState({ wishlist: [products[0].slug] })
  setup("/wishlist")
  expect(screen.getAllByRole("link", { name: products[0].name }).length).toBe(2)
  expect(screen.queryByRole("link", { name: products[1].name })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: `Bỏ yêu thích ${products[0].name}` }))
  expect(screen.getByRole("heading", { name: "Bắt đầu bộ sưu tập của bạn" })).toBeTruthy()
})

it("changes the homepage banner using its collection controls", () => {
  setup()
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("ELECTRONICS")
  fireEvent.click(screen.getByRole("button", { name: "Next banner" }))
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Headlights")
  expect(screen.getByRole("button", { name: "Phone", pressed: true })).toBeTruthy()
})

it("changes the featured homepage product collection", () => {
  setup()
  expect(screen.getByRole("heading", { name: products[0].name })).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "BESTSELLER PRODUCTS" }))
  expect(screen.queryByRole("heading", { name: products[0].name })).toBeNull()
  expect(screen.getByRole("button", { name: "BESTSELLER PRODUCTS", pressed: true })).toBeTruthy()
})

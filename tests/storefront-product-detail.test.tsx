import { beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import StorefrontLayout from "@/layout/storefront/storefront-layout"
import ProductDetail from "@/pages/storefront/product-detail"
import Cart from "@/pages/storefront/cart"
import { useStorefront } from "@/features/storefront/store"
import { blueSilenceImages, getCartLines } from "@/features/storefront/product-options"
import { products } from "@/features/storefront/catalog"

// Keep the presentation tests deterministic; HTTP integration is covered separately.
vi.mock("@/features/storefront/hooks/use-storefront-product", () => ({
  useStorefrontProduct: (slug: string) => {
    const product = products.find(item => item.slug === slug)
    return { data: product, isPending: false, isError: !product, error: product ? null : { response: { status: 404 }, isAxiosError: true }, refetch: vi.fn() }
  },
}))

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  useStorefront.setState({ cart: {}, wishlist: [], apiProducts: {} })
})

function setup(path = "/headphones/blue-silence") {
  const router = createMemoryRouter([{
    element: <StorefrontLayout />,
    children: [
      { path: "/:categorySlug/:slug", element: <ProductDetail /> },
      { path: "/cart", element: <Cart /> },
    ],
  }], { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  return router
}

it("renders the Blue Silence layout with right-hand shopping policies and five gallery views", () => {
  setup()
  expect(screen.getByRole("heading", { name: "BLUE SILENCE", level: 1 })).toBeTruthy()
  expect(screen.getByRole("complementary", { name: "Shopping policies" })).toBeTruthy()
  expect(within(screen.getByRole("group", { name: "Product images" })).getAllByRole("button")).toHaveLength(5)
  expect(screen.getByRole("radio", { name: "White — Sold Out" }).hasAttribute("disabled")).toBe(false)
})

it("changes color, price, and gallery image together", () => {
  setup()
  fireEvent.click(screen.getByRole("radio", { name: "Blue" }))
  const information = within(screen.getByRole("region", { name: "Product information" }))
  expect(information.getByText("$140.00")).toBeTruthy()
  expect(information.getByRole("img", { name: "BLUE SILENCE" }).getAttribute("src")).toBe(blueSilenceImages[0])
  expect(screen.getByRole("button", { name: "View image 1", pressed: true })).toBeTruthy()
})

it("switches the main gallery image from thumbnails and arrows", () => {
  setup()
  fireEvent.click(screen.getByRole("button", { name: "View image 2" }))
  expect(screen.getByRole("button", { name: "View image 2", pressed: true })).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Next product image" }))
  expect(screen.getByRole("button", { name: "View image 3", pressed: true })).toBeTruthy()
})

it("opens the shadcn image dialog and restores the page when it closes", async () => {
  setup()
  fireEvent.click(screen.getByRole("button", { name: "Zoom BLUE SILENCE" }))
  const dialog = await screen.findByRole("dialog", { name: "BLUE SILENCE full-size image" })
  expect(within(dialog).getByRole("img", { name: "BLUE SILENCE enlarged" })).toBeTruthy()
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
})

it("preserves color, quantity, and price in the cart and header total", async () => {
  setup()
  fireEvent.click(screen.getByRole("radio", { name: "Blue" }))
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "3" } })
  fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }))
  expect(useStorefront.getState().cart["blue-silence::Blue"]).toBe(3)
  const header = within(screen.getByRole("banner"))
  expect(header.getByText("$420.00")).toBeTruthy()
  fireEvent.click(header.getByRole("link", { name: "Giỏ hàng: 3 sản phẩm" }))
  expect(await screen.findByText("Color: Blue")).toBeTruthy()
  expect(screen.getByRole("spinbutton", { name: "Số lượng BLUE SILENCE / Blue" })).toBeTruthy()
  expect(screen.getAllByText("$420.00").length).toBeGreaterThan(1)
})

it("keeps two chosen colors as separate cart lines and rejects sold-out White", () => {
  const state = useStorefront.getState()
  state.addToCart("blue-silence", 2, "Blue")
  state.addToCart("blue-silence", 1, "Green")
  state.addToCart("blue-silence", 1, "White")
  const lines = getCartLines(useStorefront.getState().cart)
  expect(lines).toHaveLength(2)
  expect(lines.map(line => [line.option?.name, line.quantity, line.price])).toEqual([["Blue", 2, 140], ["Green", 1, 150]])
})

it("changes detail tabs by keyboard and loads video only when selected", async () => {
  const { container } = render(<RouterProvider router={createMemoryRouter([{ path: "/:categorySlug/:slug", element: <ProductDetail /> }], { initialEntries: ["/headphones/blue-silence"] })} />)
  expect(container.querySelector("iframe")).toBeNull()
  await act(async () => {
    screen.getByRole("tab", { name: "Description" }).focus()
    fireEvent.keyDown(screen.getByRole("tab", { name: "Description" }), { key: "ArrowRight" })
  })
  expect(await screen.findByRole("tab", { name: "Review", selected: true })).toBeTruthy()
  expect(screen.getByText("No reviews yet.")).toBeTruthy()
  fireEvent.click(screen.getByRole("tab", { name: "Video" }))
  expect(screen.getByTitle("Blue Silence reference product video")).toBeTruthy()
})

it("resets options and quantity when navigating to another product", async () => {
  const router = setup()
  fireEvent.click(screen.getByRole("radio", { name: "Orange" }))
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "5" } })
  await act(() => router.navigate("/headphones/headphones-klm"))
  expect(screen.getByRole("heading", { level: 1, name: "HEADPHONES KLM" })).toBeTruthy()
  expect((screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement).value).toBe("1")
  expect(screen.queryByRole("radio", { name: "Orange" })).toBeNull()
})

it("shows a safe fallback for a product that does not exist", () => {
  setup("/headphones/does-not-exist")
  expect(screen.getByRole("heading", { name: "Product not found" })).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Add to Cart" })).toBeNull()
})


it("shows the purchase bar only after the navbar passes and shares variant, quantity and cart actions", () => {
  vi.stubGlobal("IntersectionObserver", undefined)
  setup()
  const navbar = document.querySelector(".sf-nav-wrap")!
  const bounds = vi.spyOn(navbar, "getBoundingClientRect")
  const scroll = vi.spyOn(window, "scrollY", "get")
  expect(screen.queryByRole("region", { name: "Purchase summary" })).toBeNull()
  fireEvent.click(screen.getByRole("radio", { name: "Blue" }))
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "3" } })
  bounds.mockReturnValue({ bottom: -1 } as DOMRect)
  scroll.mockReturnValue(500)
  fireEvent.scroll(window)
  const bar = within(screen.getByRole("region", { name: "Purchase summary" }))
  expect(bar.getByText("$420.00")).toBeTruthy()
  fireEvent.click(bar.getAllByRole("button")[0])
  expect(useStorefront.getState().cart["blue-silence::Blue"]).toBe(3)
  bounds.mockReturnValue({ bottom: 100 } as DOMRect)
  scroll.mockReturnValue(0)
  fireEvent.scroll(window)
  expect(screen.queryByRole("region", { name: "Purchase summary" })).toBeNull()
  bounds.mockRestore()
  scroll.mockRestore()
  vi.unstubAllGlobals()
})

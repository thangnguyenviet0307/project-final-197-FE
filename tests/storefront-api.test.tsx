import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { storefrontApi, getStorefrontProduct } from "@/features/storefront/services/products.service"
import { useStorefront } from "@/features/storefront/store"
import { useAuthStore } from "@/stores/auth.store"
import { routes } from "@/router/routes"
import { RootFallback, RootLayout } from "@/layout/root-layout"

const product = {
  id: "a".repeat(24), slug: "api-headphones", name: "API Headphones", description: '<p>Real product description</p><script>alert("xss")</script>',
  modelYear: 2026, category: { id: "b".repeat(24), name: "Audio", slug: "audio" },
  brand: { id: "c".repeat(24), name: "Real Brand", slug: "real-brand" },
  price: 125, compareAtPrice: 150, available: true, thumbnail: "https://images.test/main.jpg", images: ["https://images.test/main.jpg", "https://images.test/side.jpg"],
  variants: [
    { id: "v1", sku: "BLACK-1", name: "Black / Large", color: "Black", size: "L", price: 125, compareAtPrice: 150, available: true, image: "https://images.test/black.jpg", images: [] },
    { id: "v2", sku: "BLUE-2", name: "Blue / Small", color: "Blue", size: "S", price: 140, compareAtPrice: 160, available: true, image: "https://images.test/blue.jpg", images: [] },
    { id: "v3", sku: "WHITE-3", name: "White", color: "White", size: null, price: 130, compareAtPrice: 130, available: false, image: null, images: [] },
  ],
}

// Resolve the real lazy route modules before assertions start timing network states.
beforeAll(async () => { await Promise.all([import("@/pages/storefront/product-detail"), import("@/layout/storefront/storefront-layout")]) })

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  useStorefront.setState({ cart: {}, wishlist: [], apiProducts: {} })
})
afterEach(() => { vi.restoreAllMocks(); useAuthStore.getState().clearSession() })

function setup(path = "/audio/api-headphones") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  const router = createMemoryRouter([{ element: <RootLayout />, HydrateFallback: RootFallback, children: routes }], { initialEntries: [path] })
  const result = render(<QueryClientProvider client={client}><RouterProvider router={router} /></QueryClientProvider>)
  return { router, ...result }
}

it("loads the real slug route and sanitizes the API description", async () => {
  const request = vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: product } })
  const { container } = setup()
  expect(await screen.findByRole("heading", { name: product.name, level: 1 })).toBeTruthy()
  expect(request).toHaveBeenCalledWith("/storefront/products/api-headphones", { signal: expect.any(AbortSignal) })
  expect(screen.getByText("Real product description")).toBeTruthy()
  expect(container.querySelector(".pd-api-description script")).toBeNull()
  expect(screen.queryByText("SALE30")).toBeNull()
  expect(screen.queryByRole("heading", { name: "BLUE SILENCE" })).toBeNull()
})

it("renders the shopping policies and API product carousels from public recommendations", async () => {
  vi.spyOn(storefrontApi, "get").mockImplementation(async url => ({ data: { success: true, data: String(url).endsWith('/recommendations') ? [{ ...product, id: 'recommended-id', slug: 'recommended-headphones', name: 'Recommended Headphones' }] : product } }))
  setup()
  expect(await screen.findByRole("complementary", { name: "Shopping policies" })).toBeTruthy()
  expect(await screen.findByRole("region", { name: "Latest products" })).toBeTruthy()
  expect(await screen.findByRole("region", { name: "Upsell products" })).toBeTruthy()
  expect(screen.getAllByRole("link", { name: "Recommended Headphones" })[0].getAttribute("href")).toBe("/audio/recommended-headphones")
})

it("redirects an incorrect category segment to the actual category slug from the API", async () => {
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: product } })
  const { router } = setup("/wrong-category/api-headphones")
  expect(await screen.findByRole("heading", { name: product.name, level: 1 })).toBeTruthy()
  expect(router.state.location.pathname).toBe("/audio/api-headphones")
})

it("builds thumbnails from variant images and keeps color selection independent from image browsing", async () => {
  const blueSide = "https://images.test/blue-side.jpg"
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: {
    ...product,
    variants: product.variants.map(variant => variant.id === "v2" ? { ...variant, images: [variant.image, blueSide] } : variant),
  } } })
  setup()
  await screen.findByRole("heading", { name: product.name, level: 1 })
  const gallery = within(screen.getByRole("group", { name: "Product images" }))
  expect(gallery.getAllByRole("button")).toHaveLength(3)
  fireEvent.click(screen.getByRole("radio", { name: "Blue / Small" }))
  expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(product.variants[1].image)
  expect(gallery.getByRole("button", { name: "View image 2", pressed: true })).toBeTruthy()
  fireEvent.click(gallery.getByRole("button", { name: "View image 1" }))
  expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(product.variants[0].image)
  expect((screen.getByRole("radio", { name: "Blue / Small" }) as HTMLInputElement).checked).toBe(true)
  fireEvent.click(gallery.getByRole("button", { name: "View image 3" }))
  expect(screen.getByRole("img", { name: product.name }).getAttribute("src")).toBe(blueSide)
  fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }))
  expect(useStorefront.getState().cart["api-headphones::v2"]).toBe(1)
})

it("uses product images when variants have no images", async () => {
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: {
    ...product, variants: product.variants.map(variant => ({ ...variant, image: null, images: [] })),
  } } })
  setup()
  await screen.findByRole("heading", { name: product.name, level: 1 })
  expect(within(screen.getByRole("group", { name: "Product images" })).getAllByRole("button")).toHaveLength(2)
})

it("uses API variant IDs and prices in cart instead of demo options", async () => {
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: product } })
  setup()
  fireEvent.click(await screen.findByRole("radio", { name: "Blue / Small" }))
  fireEvent.change(screen.getByRole("spinbutton", { name: "Quantity" }), { target: { value: "2" } })
  fireEvent.click(screen.getByRole("button", { name: "Add to Cart" }))
  expect(useStorefront.getState().cart["api-headphones::v2"]).toBe(2)
  const header = within(screen.getByRole("banner"))
  expect(header.getByText("$280.00")).toBeTruthy()
  fireEvent.click(header.getByRole("link", { name: "Giỏ hàng: 2 sản phẩm" }))
  expect(await screen.findByText("Color: Blue / Small")).toBeTruthy()
  expect(screen.getByRole("spinbutton", { name: "Số lượng API Headphones / Blue / Small" })).toBeTruthy()
})

it("shows loading until the API resolves without displaying a fixture product", async () => {
  let finish!: (value: { data: { success: boolean; data: typeof product } }) => void
  vi.spyOn(storefrontApi, "get").mockImplementation(() => new Promise(resolve => { finish = resolve }))
  setup()
  expect(await screen.findByRole("status", { name: "Loading product" })).toBeTruthy()
  expect(screen.queryByRole("heading", { name: product.name })).toBeNull()
  await act(async () => { finish({ data: { success: true, data: product } }) })
  expect(await screen.findByRole("heading", { name: product.name, level: 1 })).toBeTruthy()
})

it("handles a missing slug result without substituting a demo product", async () => {
  vi.spyOn(storefrontApi, "get").mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
  setup("/headphones/blue-silence")
  expect(await screen.findByRole("heading", { name: "Product not found" })).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Add to Cart" })).toBeNull()
})

it("can retry a failed public API call", async () => {
  vi.spyOn(storefrontApi, "get").mockRejectedValueOnce(new Error("Network error")).mockResolvedValue({ data: { success: true, data: product } })
  setup()
  fireEvent.click(await screen.findByRole("button", { name: "Try again" }))
  expect(await screen.findByRole("heading", { name: product.name, level: 1 })).toBeTruthy()
})

it("does not label an unregistered API endpoint as a missing product", async () => {
  vi.spyOn(storefrontApi, "get").mockRejectedValue({ isAxiosError: true, response: { status: 404, data: { message: "Not Found" } } })
  setup()
  expect(await screen.findByRole("heading", { name: "Unable to load product" })).toBeTruthy()
  expect(screen.queryByRole("heading", { name: "Product not found" })).toBeNull()
  expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy()
})

it("allows selecting sold-out variants and restores purchase when an in-stock color is selected", async () => {
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: product } })
  setup()
  const white = await screen.findByRole("radio", { name: "White — Sold Out" })
  fireEvent.click(white)
  expect((white as HTMLInputElement).checked).toBe(true)
  const information = within(screen.getByRole("region", { name: "Product information" }))
  expect(information.queryByText("In Stock")).toBeNull()
  expect(information.getByText("$130.00")).toBeTruthy()
  expect(screen.getByRole("button", { name: "Out of Stock" }).hasAttribute("disabled")).toBe(true)
  expect(screen.getByRole("button", { name: "Buy it now" }).hasAttribute("disabled")).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Out of Stock" }))
  expect(useStorefront.getState().cart).toEqual({})
  fireEvent.click(screen.getByRole("radio", { name: "Blue / Small" }))
  expect(information.getByText("In Stock")).toBeTruthy()
  expect(information.queryByText("Out of Stock")).toBeNull()
  expect(screen.getByRole("button", { name: "Add to Cart" }).hasAttribute("disabled")).toBe(false)
  expect(screen.getByRole("button", { name: "Buy it now" }).hasAttribute("disabled")).toBe(false)
})

it("disables purchase when the API reports an unavailable product", async () => {
  vi.spyOn(storefrontApi, "get").mockResolvedValue({ data: { success: true, data: { ...product, available: false, variants: [] } } })
  setup()
  expect((await screen.findByRole("button", { name: "Out of Stock" })).hasAttribute("disabled")).toBe(true)
})

it("sends public requests without staff credentials and URL-encodes slugs", async () => {
  const originalAdapter = storefrontApi.defaults.adapter
  useAuthStore.setState({ accessToken: "staff-token", hasSession: true })
  storefrontApi.defaults.adapter = async config => {
    expect(config.headers.get("Authorization")).toBeUndefined()
    expect(config.withCredentials).toBe(false)
    expect(config.url).toBe("/storefront/products/special%2Fslug")
    return { data: { success: true, data: product }, status: 200, statusText: "OK", headers: {}, config }
  }
  try { expect((await getStorefrontProduct("special/slug")).name).toBe(product.name) }
  finally { storefrontApi.defaults.adapter = originalAdapter }
})

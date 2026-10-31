import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ProductSection } from "@/features/storefront/components/product-section"
import { FeaturedParts } from "@/features/storefront/components/featured-parts"
import { listStoreProducts } from "@/features/storefront/services/catalog.service"
vi.mock("@/features/storefront/services/catalog.service", () => ({ listStoreProducts: vi.fn() }))
afterEach(() => vi.unstubAllGlobals())
let total = 17
beforeEach(() => {
  total = 17
  vi.mocked(listStoreProducts).mockReset()
  vi.mocked(listStoreProducts).mockImplementation(async params => {
    const offset = ((params.page ?? 1) - 1) * 8
    return { data: Array.from({ length: Math.min(8, Math.max(0, total - offset)) }, (_, index) => ({ _id: String(offset + index), slug: `item-${offset + index}`, product_name: `Item ${offset + index}`, category: null, brand: null, price: 100, count_view: 42 })), pagination: { page: params.page ?? 1, limit: 8, totalPages: Math.ceil(total / 8), total } }
  })
})
function setup(children: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><MemoryRouter>{children}</MemoryRouter></QueryClientProvider>)
}
async function expectColumn(column: number, region: ParentNode = document) {
  await waitFor(() => expect((region.querySelector(".product-carousel-track") as HTMLElement)?.style.getPropertyValue("--column-offset")).toBe(String(column)))
}
it.each([["is_home", "Trang chủ"], ["is_new", "Mới"], ["is_hot", "Nổi bật"], ["is_best_seller", "Bán chạy"]] as const)("limits home section %s to its own badge", async (flag, label) => {
  vi.mocked(listStoreProducts).mockResolvedValue({ data: [{ _id: "mixed", slug: "mixed", product_name: "Mixed", category: null, brand: null, price: 100, on_sale: true, is_home: true, is_new: true, is_hot: true, is_best_seller: true }], pagination: { page: 1, limit: 8, total: 1, totalPages: 1 } })
  setup(<ProductSection title="Section" filters={{ [flag]: true }} />)
  await screen.findByRole("link", { name: "Xem Mixed" })
  const region = screen.getByRole("region", { name: "Section" })
  for (const badge of ["Trang chủ", "Mới", "Nổi bật", "Bán chạy"]) {
    if (badge === label) expect(within(region).getByText(badge)).toBeTruthy()
    else expect(within(region).queryByText(badge)).toBeNull()
  }
  expect(within(region).queryByText("Đang bán")).toBeNull()
})
it("slides one column/two products at a time, retains earlier cards and stops at a full final window", async () => {
  setup(<ProductSection title="Best Seller" filters={{ is_best_seller: true }} />)
  await screen.findByRole("link", { name: "Xem Item 0" })
  const region = screen.getByRole("region", { name: "Best Seller" })
  const previous = within(region).getByRole("button", { name: /trước/ }) as HTMLButtonElement
  const next = within(region).getByRole("button", { name: /tiếp theo/ }) as HTMLButtonElement
  expect(within(region).getAllByRole("article")).toHaveLength(8)
  expect(previous.disabled).toBe(true)
  fireEvent.click(next)
  await expectColumn(1)
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 2, limit: 8, is_best_seller: true }, expect.any(AbortSignal))
  expect(within(region).queryByRole("link", { name: "Xem Item 0" })).toBeNull()
  expect(region.querySelectorAll("article")).toHaveLength(16)
  fireEvent.click(previous)
  await expectColumn(0)
  expect(listStoreProducts).toHaveBeenCalledTimes(2)
  for (let step = 0; step < 5; step++) {
    fireEvent.click(next)
    await expectColumn(step + 1)
  }
  expect(next.disabled).toBe(true)
  expect(within(region).getAllByRole("article")).toHaveLength(7)
  expect(region.querySelectorAll(".product-carousel-placeholder")).toHaveLength(1)
})
it("keeps eight frame slots with too few Best Seller products", async () => {
  total = 2
  setup(<ProductSection title="Best Seller" filters={{ is_best_seller: true }} />)
  await screen.findByRole("link", { name: "Xem Item 0" })
  expect(screen.queryByRole("button")).toBeNull()
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 1, limit: 8, is_best_seller: true }, expect.any(AbortSignal))
  expect(document.querySelectorAll(".product-carousel-item")).toHaveLength(8)
  expect(document.querySelectorAll(".product-carousel-placeholder")).toHaveLength(6)
  expect(screen.queryByText(/lượt xem/)).toBeNull()
})
it("retains the frame and current cards when loading another column fails", async () => {
  setup(<ProductSection title="Best Seller" filters={{ is_best_seller: true }} />)
  await screen.findByRole("link", { name: "Xem Item 0" })
  vi.mocked(listStoreProducts).mockRejectedValueOnce(new Error("Offline"))
  fireEvent.click(screen.getByRole("button", { name: /tiếp theo/ }))
  await screen.findByRole("alert")
  expect(document.querySelectorAll(".product-carousel-item")).toHaveLength(8)
  await expectColumn(0)
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: /tiếp theo/ }))
  await expectColumn(1)
})
it("keeps section columns independent and resets Home when its filter changes", async () => {
  setup(<><FeaturedParts /><ProductSection title="Best Seller" filters={{ is_best_seller: true }} /></>)
  const home = screen.getByRole("region", { name: "Sản phẩm" })
  await within(home).findByRole("link", { name: "Xem Item 0" })
  fireEvent.click(within(home).getByRole("button", { name: /tiếp theo/ }))
  await expectColumn(1, home)
  await expectColumn(0, screen.getByRole("region", { name: "Best Seller" }))
  fireEvent.click(within(home).getByRole("button", { name: "Nổi bật" }))
  await within(screen.getByRole("region", { name: "Sản phẩm" })).findByRole("link", { name: "Xem Item 0" })
  await expectColumn(0, screen.getByRole("region", { name: "Sản phẩm" }))
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 1, limit: 8, is_hot: true }, expect.any(AbortSignal))
})

it("uses two columns on mobile and still advances just one column", async () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  total = 8
  setup(<ProductSection title="Best Seller" filters={{ is_best_seller: true }} />)
  await screen.findByRole("link", { name: "Xem Item 0" })
  fireEvent.click(screen.getByRole("button", { name: /tiếp theo/ }))
  await expectColumn(1)
  expect(listStoreProducts).toHaveBeenCalledTimes(1)
})

it("orders Home/New/Featured filters and maps Featured to the admin Hot flag", async () => {
  setup(<FeaturedParts />)
  await screen.findByRole("link", { name: "Xem Item 0" })
  const filters = screen.getAllByRole("button").filter(button => button.hasAttribute("aria-pressed"))
  expect(filters.map(button => button.textContent)).toEqual(["Trang chủ", "Mới", "Nổi bật"])
  expect(filters[0].getAttribute("aria-pressed")).toBe("true")
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 1, limit: 8, is_home: true }, expect.any(AbortSignal))
  fireEvent.click(screen.getByRole("button", { name: "Mới" }))
  await screen.findByRole("link", { name: "Xem Item 0" })
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 1, limit: 8, is_new: true }, expect.any(AbortSignal))
  fireEvent.click(screen.getByRole("button", { name: "Nổi bật" }))
  await screen.findByRole("link", { name: "Xem Item 0" })
  expect(listStoreProducts).toHaveBeenLastCalledWith({ page: 1, limit: 8, is_hot: true }, expect.any(AbortSignal))
})

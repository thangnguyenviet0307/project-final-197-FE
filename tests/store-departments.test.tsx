import { expect, it, vi } from "vitest"
import { fireEvent, render as renderUI, screen } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import { StoreDepartmentsMenu } from "@/layout/storefront/store-departments-menu"
function render(ui: import("react").ReactElement) { return renderUI(ui, { wrapper: MemoryRouter }) }

const query = vi.hoisted(() => ({ data: [
  { _id: "1", name: "Linh kiện", slug: "linh-kien" },
  { _id: "2", name: "Bàn phím", slug: "ban-phim", parent: "1" },
  { _id: "3", name: "Phụ kiện", slug: "phu-kien", parent: "missing" },
], isPending: false, isError: false, isFetching: false, refetch: vi.fn() }))
vi.mock("@/features/categories/hooks/use-public-categories", () => ({ usePublicCategories: () => query }))
const productLookup = vi.hoisted(() => vi.fn())
vi.mock("@/features/storefront/hooks/use-store-products", () => ({ useStoreProducts: productLookup }))

it("shows only categories and does not query the product list", () => {
  render(<StoreDepartmentsMenu />)
  fireEvent.click(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }))
  expect(screen.queryByText(/Tất cả sản phẩm/)).toBeNull()
  expect(productLookup).not.toHaveBeenCalled()
})

it("opens the child mega menu on desktop hover and closes it when leaving the whole branch", () => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })))
  try {
    render(<StoreDepartmentsMenu />)
    fireEvent.click(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }))
    const parent = screen.getByRole("button", { name: /Linh kiện/ })
    fireEvent.mouseEnter(parent.closest("li")!)
    expect(parent.getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByText("Bàn phím")).toBeTruthy()
    fireEvent.mouseLeave(parent.closest("li")!)
    expect(screen.queryByText("Bàn phím")).toBeNull()
  } finally {
    vi.unstubAllGlobals()
  }
})

it("navigates from a root category with children and closes the departments panel", () => {
  function Location() { return <p data-testid="location">{useLocation().search}</p> }
  render(<><StoreDepartmentsMenu /><Location /></>)
  fireEvent.click(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }))
  const root = screen.getByRole("link", { name: /Linh kiện/ })
  expect(root.getAttribute("href")).toBe("/shop?category=1")
  fireEvent.click(root)
  expect(screen.getByTestId("location").textContent).toBe("?category=1")
  expect(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }).getAttribute("aria-expanded")).toBe("false")
})

it("renders API hierarchy and unavailable-parent children; handles empty, loading and retry states", () => {
  const { rerender } = render(<StoreDepartmentsMenu />)
  fireEvent.click(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }))
  expect(screen.getByText("Phụ kiện")).toBeTruthy()
  expect(screen.queryByText("Bàn phím")).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: /Linh kiện/ }))
  expect(screen.getByText("Bàn phím")).toBeTruthy()
  fireEvent.keyDown(document, { key: "Escape" })
  expect(screen.queryByText("Bàn phím")).toBeNull()
  query.data = []
  rerender(<StoreDepartmentsMenu />)
  fireEvent.click(screen.getByRole("button", { name: "DANH MỤC SẢN PHẨM" }))
  expect(screen.getByText("Chưa có danh mục sản phẩm.")).toBeTruthy()
  query.isError = true
  rerender(<StoreDepartmentsMenu />)
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  expect(query.refetch).toHaveBeenCalledOnce()
  query.isError = false
  query.isPending = true
  rerender(<StoreDepartmentsMenu />)
  expect(screen.getByRole("status").textContent).toContain("Đang tải")
})

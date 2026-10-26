import { expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { StoreDepartmentsMenu } from "@/layout/storefront/store-departments-menu"

const query = vi.hoisted(() => ({ data: [
  { _id: "1", name: "Linh kiện", slug: "linh-kien" },
  { _id: "2", name: "Bàn phím", slug: "ban-phim", parent: "1" },
  { _id: "3", name: "Phụ kiện", slug: "phu-kien", parent: "missing" },
], isPending: false, isError: false, isFetching: false, refetch: vi.fn() }))
vi.mock("@/features/categories/hooks/use-public-categories", () => ({ usePublicCategories: () => query }))

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

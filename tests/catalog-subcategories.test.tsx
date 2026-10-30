import { beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, useLocation } from "react-router-dom"
import StorefrontProductsPage from "@/pages/storefront/products"
import { CatalogSubcategories } from "@/features/storefront/components/catalog-subcategories"

const state = vi.hoisted(() => ({ list: vi.fn() }))
const parent = "a".repeat(24), child = "b".repeat(24), sibling = "c".repeat(24), other = "d".repeat(24)
vi.mock("@/features/categories/hooks/use-public-categories", () => ({ usePublicCategories: () => ({ data: [
  { _id: "a".repeat(24), name: "Books", slug: "books" },
  { _id: "b".repeat(24), name: "Tiểu thuyết", slug: "tieu-thuyet", parent: "a".repeat(24) },
  { _id: "c".repeat(24), name: "Sách thiếu nhi", slug: "sach-thieu-nhi", parent: "a".repeat(24) },
  { _id: "d".repeat(24), name: "Phụ kiện", slug: "phu-kien" },
] }) }))
vi.mock("@/features/brands/hooks/use-public-brands", () => ({ usePublicBrands: () => ({ data: [] }) }))
vi.mock("@/features/storefront/hooks/use-store-filter-count", () => ({ useStoreFilterCount: () => ({ data: 0, isFetching: false, isError: false }) }))
vi.mock("@/features/storefront/hooks/use-store-products", () => ({ useStoreProducts: (params: unknown) => {
  state.list(params)
  return { data: { data: [], pagination: { total: 0, totalPages: 1 } }, isPending: false, isError: false }
} }))
beforeEach(() => vi.clearAllMocks())
function Location() { return <p data-testid="location">{useLocation().search}</p> }
function mount(search: string) {
  render(<MemoryRouter initialEntries={[`/shop${search}`]}><StorefrontProductsPage /><Location /></MemoryRouter>)
}

it("narrows a parent to a child, keeps sibling navigation and preserves other filters", () => {
  mount(`?category=${parent},${other}&brand=${"e".repeat(24)}&minPrice=100&search=book&sort=price-desc&page=4`)
  const row = screen.getByRole("navigation", { name: "Danh mục con của Books" })
  expect(within(row).queryByText("Danh mục con:")).toBeNull()
  expect(within(row).queryByRole("button", { name: "Books" })).toBeNull()
  fireEvent.click(within(row).getByRole("button", { name: "Tiểu thuyết" }))
  const params = new URLSearchParams(screen.getByTestId("location").textContent!)
  expect(params.get("category")).toBe(`${parent},${other}`)
  expect(params.get("subcategory")).toBe(child)
  expect(screen.getByRole("button", { name: "Bỏ Books" })).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Bỏ Tiểu thuyết" })).toBeNull()
  expect(params.get("brand")).toBe("e".repeat(24))
  expect(params.get("minPrice")).toBe("100")
  expect(params.get("search")).toBe("book")
  expect(params.get("sort")).toBe("price-desc")
  expect(params.has("page")).toBe(false)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: `${child},${other}`, page: 1 }))
  const updated = screen.getByRole("navigation", { name: "Danh mục con của Books" })
  expect(within(updated).getByRole("button", { name: "Tiểu thuyết" }).getAttribute("aria-pressed")).toBe("true")
  fireEvent.click(within(updated).getByRole("button", { name: "Sách thiếu nhi" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: `${sibling},${other}` }))
  fireEvent.click(screen.getByRole("button", { name: "Sách thiếu nhi" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: `${parent},${other}` }))
  expect(new URLSearchParams(screen.getByTestId("location").textContent!).has("subcategory")).toBe(false)
  expect(screen.getByRole("button", { name: "Sách thiếu nhi" }).getAttribute("aria-pressed")).toBe("false")
})

it("resolves a category slug before showing child choices", () => {
  mount("?category=books")
  expect(screen.getByRole("navigation", { name: "Danh mục con của Books" })).toBeTruthy()
})

it("does not show an empty category row with no category filter", () => {
  mount("")
  expect(screen.queryByRole("region", { name: "Chọn danh mục con" })).toBeNull()
})

it("does not show an empty row for an independent leaf category", () => {
  mount(`?category=${other}`)
  expect(screen.queryByRole("region", { name: "Chọn danh mục con" })).toBeNull()
})

it("restores child refinement from the URL while keeping the parent chip and clears it when the parent is removed", () => {
  mount(`?category=${parent},${other}&subcategory=${child}`)
  expect(screen.getByRole("button", { name: "Bỏ Books" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Tiểu thuyết" }).getAttribute("aria-pressed")).toBe("true")
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: `${child},${other}` }))
  fireEvent.click(screen.getByRole("button", { name: "Bỏ Books" }))
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: other }))
  expect(new URLSearchParams(screen.getByTestId("location").textContent!).has("subcategory")).toBe(false)
  expect(screen.queryByRole("region", { name: "Chọn danh mục con" })).toBeNull()
})

it("ignores a child refinement that does not belong to a selected parent", () => {
  mount(`?category=${other}&subcategory=${child}`)
  expect(state.list).toHaveBeenLastCalledWith(expect.objectContaining({ category: other }))
})

it("uses actual parent IDs to distinguish Books with Toys from the childless Books (2)", () => {
  const books = "6ae06cdacc9aaa0c72d62289"
  const books2 = "6ae06ce0b3306175a00c4400"
  const categories = [
    { _id: books, name: "Books", slug: "books" },
    { _id: books2, name: "Books (2)", slug: "books-2" },
    { _id: "6ae06cdacc9aaa0c72d6228e", name: "Toys", slug: "toys", parent: books },
  ]
  const view = render(<CatalogSubcategories categories={categories} selectedIds={[books2]} selectedChildIds={[]} onChange={vi.fn()} />)
  expect(screen.queryByRole("region", { name: "Chọn danh mục con" })).toBeNull()
  view.rerender(<CatalogSubcategories categories={categories} selectedIds={[books]} selectedChildIds={[]} onChange={vi.fn()} />)
  expect(screen.getByRole("button", { name: "Toys" })).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Books" })).toBeNull()
})

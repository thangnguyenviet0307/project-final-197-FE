import { act, fireEvent, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { expect, it, vi } from "vitest"
import StorefrontArticlesPage from "@/pages/storefront/articles"

vi.mock("@/features/storefront/hooks/use-public-articles", () => ({
  usePublicArticleCategories: () => ({ data: [] }),
  useArticleSidebar: () => ({ data: { data: [] } }),
  useArticleCatalog: () => ({ isPending: false, isError: false, isSuccess: true, isFetching: false, data: { data: [], pagination: { totalPages: 1 } } }),
}))
it("synchronizes search on history and type navigation while retaining a local draft on rerender", async () => {
  const router = createMemoryRouter([{ path: "/bai-viet", element: <StorefrontArticlesPage /> }], { initialEntries: ["/bai-viet?search=A", "/bai-viet?search=B"] })
  const view = render(<RouterProvider router={router} />)
  const input = () => screen.getByRole("textbox", { name: "Tìm tin tức" }) as HTMLInputElement
  expect(input().value).toBe("B")
  fireEvent.change(input(), { target: { value: "Draft" } })
  view.rerender(<RouterProvider router={router} />)
  expect(input().value).toBe("Draft")
  await act(async () => { await router.navigate(-1) })
  expect(input().value).toBe("A")
  fireEvent.click(screen.getByRole("link", { name: "Blog" }))
  expect(input().value).toBe("")
  expect(router.state.location.search).toBe("?type=blog")
})

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { expect, it, vi } from "vitest"
import PostCategoriesPage from "@/pages/admin/post-categories"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: import("react").ReactNode }) => children }))
vi.mock("@/features/articles/hooks/use-articles", () => ({
  usePostCategories: () => ({ isPending: false, isError: false, isFetching: false, data: [] }),
  useArticleMutations: () => ({ createCategory: { isPending: false }, updateCategory: { isPending: false }, removeCategory: { isPending: false } }),
}))
it("keeps category drafts on cancelled close/navigation and protects a new session after discard", async () => {
  const router = createMemoryRouter([{ path: "/categories", element: <PostCategoriesPage /> }, { path: "/away", element: <p>Away</p> }], { initialEntries: ["/categories"] })
  render(<RouterProvider router={router} />)
  fireEvent.click(screen.getByRole("button", { name: "Thêm danh mục bài viết" }))
  fireEvent.change(screen.getByLabelText("Tên danh mục"), { target: { value: "Draft category" } })
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  fireEvent.click(await screen.findByRole("button", { name: "Tiếp tục chỉnh sửa" }))
  expect((screen.getByLabelText("Tên danh mục") as HTMLInputElement).value).toBe("Draft category")
  await waitFor(() => expect(screen.queryByText("Bỏ các thay đổi chưa lưu?")).toBeNull())
  const unload = new Event("beforeunload", { cancelable: true })
  window.dispatchEvent(unload)
  expect(unload.defaultPrevented).toBe(true)
  await act(async () => { void router.navigate("/away") })
  fireEvent.click(await screen.findByRole("button", { name: "Tiếp tục chỉnh sửa" }))
  expect(router.state.location.pathname).toBe("/categories")
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))
  await waitFor(() => expect(screen.queryByLabelText("Tên danh mục")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Thêm danh mục bài viết" }))
  fireEvent.change(screen.getByLabelText("Tên danh mục"), { target: { value: "Second draft" } })
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  expect(await screen.findByText("Bỏ các thay đổi chưa lưu?")).toBeTruthy()
})

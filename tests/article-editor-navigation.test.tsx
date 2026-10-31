import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import AdminArticlesPage from "@/pages/admin/articles"

const fixtures = vi.hoisted(() => ({
  create: vi.fn(async () => ({})),
  categories: [{ _id: "b".repeat(24), name: "Tin tức", slug: "tin-tuc", description: "", isActive: true, __v: 0 }],
}))
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: import("react").ReactNode }) => children }))
vi.mock("@/features/articles/hooks/use-articles", () => ({
  useArticles: () => ({ isPending: false, isError: false, isFetching: false, data: { data: [], pagination: { totalPages: 1 } }, refetch: vi.fn() }),
  usePostCategories: () => ({ isPending: false, isError: false, data: fixtures.categories }),
  useArticleMutations: () => ({ create: { isPending: false, mutateAsync: fixtures.create }, update: { isPending: false }, remove: { isPending: false } }),
}))
beforeEach(() => fixtures.create.mockClear())
function setup() {
  const router = createMemoryRouter([{ path: "/auth/articles", element: <AdminArticlesPage /> }, { path: "/away", element: <p>Trang khác</p> }], { initialEntries: ["/auth/articles"] })
  render(<RouterProvider router={router} />)
  return router
}
it("confirms dirty editor closure, keeps the draft and protects the next editor after a discard", async () => {
  setup()
  fireEvent.click(screen.getByRole("button", { name: "Thêm bài viết" }))
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Bản nháp thứ nhất" } })
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  await screen.findByText("Bỏ các thay đổi chưa lưu?")
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục chỉnh sửa" }))
  expect((screen.getByLabelText("Tiêu đề") as HTMLInputElement).value).toBe("Bản nháp thứ nhất")
  await waitFor(() => expect(screen.queryByText("Bỏ các thay đổi chưa lưu?")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))
  await waitFor(() => expect(screen.queryByLabelText("Tiêu đề")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Thêm bài viết" }))
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Bản nháp thứ hai" } })
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  expect(await screen.findByText("Bỏ các thay đổi chưa lưu?")).toBeTruthy()
  expect(fixtures.create).not.toHaveBeenCalled()
})
it("blocks navigation and unload only while the article is dirty", async () => {
  const router = setup()
  fireEvent.click(screen.getByRole("button", { name: "Thêm bài viết" }))
  fireEvent.change(screen.getByLabelText("Nội dung"), { target: { value: "Nội dung chưa lưu" } })
  const unload = new Event("beforeunload", { cancelable: true })
  window.dispatchEvent(unload)
  expect(unload.defaultPrevented).toBe(true)
  await act(async () => { void router.navigate("/away") })
  fireEvent.click(await screen.findByRole("button", { name: "Tiếp tục chỉnh sửa" }))
  expect(router.state.location.pathname).toBe("/auth/articles")
  expect((screen.getByLabelText("Nội dung") as HTMLTextAreaElement).value).toBe("Nội dung chưa lưu")
  await act(async () => { void router.navigate("/away") })
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ thay đổi" }))
  expect(await screen.findByText("Trang khác")).toBeTruthy()
})
it("closes an unchanged editor without asking to discard", async () => {
  setup()
  fireEvent.click(screen.getByRole("button", { name: "Thêm bài viết" }))
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  await waitFor(() => expect(screen.queryByLabelText("Tiêu đề")).toBeNull())
  expect(screen.queryByText("Bỏ các thay đổi chưa lưu?")).toBeNull()
})

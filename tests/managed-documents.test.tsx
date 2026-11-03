import { beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import DocumentsPage from "@/pages/admin/support/documents"
import DocumentEditorPage from "@/pages/admin/support/document-editor"
import StoreDocumentPage from "@/pages/storefront/support/document"

const mocks = vi.hoisted(() => ({
  document: { key: "privacy", content: "Published", publishedContent: "Published" as string | null, __v: 3, publishedAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-02T00:00:00Z", views: 12 },
  save: vi.fn(), remove: vi.fn(), view: vi.fn(), refetch: vi.fn(),
}))
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
vi.mock("@/features/support/components/content", async importOriginal => ({ ...await importOriginal<typeof import("@/features/support/components/content")>(), ContentEditor: ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => <textarea aria-label={label} value={value} onChange={event => onChange(event.target.value)} /> }))
vi.mock("@/features/support/hooks/use-managed-documents", () => ({
  useManagedDocuments: () => ({ data: [mocks.document], isPending: false, isError: false, refetch: mocks.refetch }),
  useManagedDocument: () => ({ data: mocks.document, refetch: mocks.refetch }),
  usePublicDocument: () => ({ data: { ...mocks.document, content: "Public article body" }, isSuccess: true }),
  useDocumentView: (...args: unknown[]) => mocks.view(...args),
  useDocumentMutations: () => ({ save: { mutateAsync: mocks.save, isPending: false }, remove: { mutate: mocks.remove, reset: vi.fn(), isPending: false } }),
}))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.document = { key: "privacy", content: "Published", publishedContent: "Published", __v: 3, publishedAt: "2026-10-01T00:00:00Z", updatedAt: "2026-10-02T00:00:00Z", views: 12 }
})
const wrap = (page: React.ReactNode, path = "/auth/policies") => <MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>
it("lists policies with view/edit/add actions and no content editor", () => {
  render(wrap(<DocumentsPage />))
  expect(screen.queryByRole("textbox", { name: "Chính sách bảo mật" })).toBeNull()
  expect(screen.getByRole("link", { name: "Sửa Chính sách bảo mật" }).getAttribute("href")).toBe("/auth/policies/privacy")
  expect(screen.getByRole("link", { name: "Xem Chính sách bảo mật" }).getAttribute("href")).toBe("/chinh-sach-bao-mat")
  expect(screen.getByRole("link", { name: "Thêm Giới thiệu" }).getAttribute("href")).toBe("/auth/policies/gioi-thieu")
  fireEvent.change(screen.getByRole("textbox", { name: "Tìm chính sách" }), { target: { value: "nothing matches" } })
  expect(screen.getByText("Không tìm thấy nội dung phù hợp.")).toBeTruthy()
})
it("requires confirmation before deletion and keeps the selected original version", () => {
  const view = render(wrap(<DocumentsPage />))
  fireEvent.click(screen.getByRole("button", { name: "Xóa Chính sách bảo mật" }))
  expect(mocks.remove).not.toHaveBeenCalled()
  mocks.document = { ...mocks.document, __v: 9 }
  view.rerender(wrap(<DocumentsPage />))
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận xóa" }))
  expect(mocks.remove).toHaveBeenCalledWith({ key: "privacy", expectedVersion: 3 }, expect.any(Object))
})
it("publishes only the selected document and keeps the edit baseline through refetch", async () => {
  mocks.save.mockResolvedValue({ ...mocks.document, content: "Changed", publishedContent: "Changed", __v: 4 })
  const view = render(wrap(<DocumentEditorPage />, "/auth/policies/privacy"))
  fireEvent.change(screen.getByRole("textbox", { name: "Chính sách bảo mật" }), { target: { value: "Changed" } })
  mocks.document = { ...mocks.document, content: "Remote", __v: 8 }
  view.rerender(wrap(<DocumentEditorPage />, "/auth/policies/privacy"))
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật lên web" }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ key: "privacy", content: "Changed", expectedVersion: 3, publish: true }))
})
it("retains the draft and locks writes on version conflict", async () => {
  mocks.save.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { message: "Conflict" } } })
  render(wrap(<DocumentEditorPage />, "/auth/policies/privacy"))
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Keep me" } })
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật lên web" }))
  await waitFor(() => expect((screen.getByRole("button", { name: "Lưu bản nháp" }) as HTMLButtonElement).disabled).toBe(true))
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Keep me")
})
it("places dates and views below the public body and records the opened document", () => {
  const { container } = render(wrap(<StoreDocumentPage />, "/chinh-sach-bao-mat"))
  const article = container.querySelector("article")!
  const footer = article.querySelector("footer")!
  expect(footer.previousElementSibling?.textContent).toBe("Public article body")
  expect(footer.textContent).toContain("12 lượt xem")
  expect(footer.textContent).toContain("Ngày đăng:")
  expect(footer.textContent).toContain("Cập nhật:")
  expect(footer.querySelectorAll("time")).toHaveLength(2)
  expect(mocks.view).toHaveBeenCalledWith("privacy", true, expect.any(String))
})

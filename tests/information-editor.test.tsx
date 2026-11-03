import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import AdminInformationPage from "@/pages/admin/support/information"

const mocks = vi.hoisted(() => ({ query: { data: { content: "Original", __v: 2, publishedAt: null }, isError: false, refetch: vi.fn() }, save: vi.fn() }))
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
vi.mock("@/features/support/hooks/use-information", () => ({ useAdminInformation: () => mocks.query, useSaveInformation: () => ({ mutateAsync: mocks.save, isPending: false }) }))
vi.mock("@/features/support/components/content", () => ({ ContentEditor: ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => <textarea aria-label={label} value={value} onChange={event => onChange(event.target.value)} /> }))
beforeEach(() => { vi.clearAllMocks(); mocks.query.data = { content: "Original", __v: 2, publishedAt: null } })
const wrap = () => <MemoryRouter initialEntries={["/auth/policies/gioi-thieu"]}><AdminInformationPage /></MemoryRouter>
it("retains dirty information and original version through background data changes", async () => {
  mocks.save.mockResolvedValue({ content: "Draft", __v: 3, publishedAt: null })
  const view = render(wrap())
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } })
  mocks.query.data = { content: "Remote", __v: 9, publishedAt: null }
  view.rerender(wrap())
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Draft")
  fireEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ slug: "gioi-thieu", content: "Draft", expectedVersion: 2, publish: false }))
})
it("retains the draft and disables both writes after conflict", async () => {
  mocks.save.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { message: "Conflict" } } })
  render(wrap())
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Keep draft" } })
  fireEvent.click(screen.getByRole("button", { name: "Công bố" }))
  await waitFor(() => expect((screen.getByRole("button", { name: "Lưu bản nháp" }) as HTMLButtonElement).disabled).toBe(true))
  expect((screen.getByRole("button", { name: "Công bố" }) as HTMLButtonElement).disabled).toBe(true)
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Keep draft")
})

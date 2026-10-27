import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import AdminHeroSlidesPage from "@/pages/admin/hero-slides"
import { api, clearAuth } from "@/services/api"
import type { HeroSlide } from "@/features/hero-slides/types/hero-slides"
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
vi.mock("@/features/categories/hooks/use-categories", () => ({ useCategories: () => ({ data: [{ _id: "a".repeat(24), name: "Tai nghe", isActive: true, isDeleted: false }, { _id: "b".repeat(24), name: "Hidden", isActive: false, isDeleted: false }], isPending: false, isError: false }) }))
const originalAdapter = api.defaults.adapter
const initial: HeroSlide = { _id: "c".repeat(24), category: { _id: "a".repeat(24), name: "Tai nghe", isActive: true, isDeleted: false }, title: "Original title", description: "Keep description", imageUrl: null, sortOrder: 2, isActive: true, __v: 3 }
let rows: HeroSlide[]
let writes: { method?: string; url?: string; body: Record<string, unknown> }[]
let conflict = false
let client: QueryClient
beforeEach(() => {
  rows = [{ ...initial }]; writes = []; conflict = false; clearAuth()
  client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  api.defaults.adapter = async config => {
    if (config.method !== "get") {
      const body = JSON.parse(config.data) as Record<string, unknown>
      writes.push({ method: config.method, url: config.url, body })
      if (conflict) throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, status: 409, statusText: "Conflict", headers: new AxiosHeaders(), data: { message: "Slide changed. Reload before saving." } })
      if (config.method === "delete") rows = []
      else rows = [{ ...rows[0] ?? initial, ...body, category: initial.category, __v: (rows[0]?.__v ?? 0) + 1 } as HeroSlide]
    }
    return { config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data: { data: config.method === "get" ? rows : rows[0] } }
  }
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth(); client.clear() })
function setup() { return render(<QueryClientProvider client={client}><MemoryRouter><AdminHeroSlidesPage /></MemoryRouter></QueryClientProvider>) }

it("creates a category slide with custom content and no custom CTA or inactive category choices", async () => {
  rows = []; setup()
  await screen.findByText(/Chưa có slide/)
  fireEvent.click(screen.getByRole("button", { name: "Thêm slide" }))
  const dialog = screen.getByRole("dialog")
  fireEvent.change(within(dialog).getByRole("combobox"), { target: { value: "a".repeat(24) } })
  expect(within(dialog).queryByRole("option", { name: "Hidden" })).toBeNull()
  fireEvent.change(within(dialog).getByLabelText("Tiêu đề"), { target: { value: " Custom title " } })
  fireEvent.change(within(dialog).getByLabelText("Mô tả"), { target: { value: "Custom description" } })
  expect(within(dialog).getByText("Nút: Khám phá Tai nghe")).toBeTruthy()
  fireEvent.click(within(dialog).getByRole("button", { name: "Lưu slide" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(writes[0]).toMatchObject({ method: "post", url: "/hero-slides", body: { category: "a".repeat(24), title: "Custom title", description: "Custom description", imageUrl: null, sortOrder: 0, isActive: true } })
})
it("sends only changed fields with the original version and invalidates public/admin hero data", async () => {
  client.setQueryData(["hero-slides", "public"], [])
  const invalidate = vi.spyOn(client, "invalidateQueries")
  setup(); await screen.findByText("Original title")
  fireEvent.click(screen.getByRole("button", { name: "Sửa" }))
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "New title" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu slide" }))
  await screen.findByText("New title")
  expect(writes[0].body).toEqual({ title: "New title", expectedVersion: 3 })
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ["hero-slides"] })
})
it("preserves drafts and blocks stale writes until an explicit reload, including background refetch", async () => {
  setup(); await screen.findByText("Original title")
  fireEvent.click(screen.getByRole("button", { name: "Sửa" }))
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Unsaved draft" } })
  conflict = true
  fireEvent.click(screen.getByRole("button", { name: "Lưu slide" }))
  await screen.findByText("Slide changed. Reload before saving.")
  rows = [{ ...initial, title: "Latest title", __v: 4 }]
  await client.invalidateQueries({ queryKey: ["hero-slides"] })
  expect((screen.getByLabelText("Tiêu đề") as HTMLTextAreaElement).value).toBe("Unsaved draft")
  expect((screen.getByRole("button", { name: "Lưu slide" }) as HTMLButtonElement).disabled).toBe(true)
  expect(writes).toHaveLength(1)
  conflict = false
  fireEvent.click(screen.getByRole("button", { name: /Tải lại dữ liệu/ }))
  await waitFor(() => expect((screen.getByLabelText("Tiêu đề") as HTMLTextAreaElement).value).toBe("Latest title"))
  fireEvent.change(screen.getByLabelText("Tiêu đề"), { target: { value: "Reviewed title" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu slide" }))
  await screen.findByText("Reviewed title")
  expect(writes[1].body).toEqual({ title: "Reviewed title", expectedVersion: 4 })
})
it("requires confirmation before deleting and sends the reviewed version", async () => {
  setup(); await screen.findByText("Original title")
  fireEvent.click(screen.getByRole("button", { name: "Xóa" }))
  expect(writes).toHaveLength(0)
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Xóa slide" }))
  await screen.findByText(/Chưa có slide/)
  expect(writes[0]).toMatchObject({ method: "delete", url: `/hero-slides/${initial._id}`, body: { expectedVersion: 3 } })
})

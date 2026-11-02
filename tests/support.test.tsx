import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import AdminPolicyPage from "@/pages/admin/support/policy"
import PolicyPage from "@/pages/storefront/support/policy"
import { WarrantyCreateForm } from "@/features/support/components/warranty-create-form"
import { savePolicySchema, createWarrantySchema } from "@/features/support/schemas/support-schema"

const content = { warranty: "Điều kiện bảo hành", returns: "Điều kiện đổi trả", shipping: "Giao hàng", payment: "COD", support: "Liên hệ cửa hàng" }
const mocks = vi.hoisted(() => ({
  admin: { data: { content: { warranty: "", returns: "", shipping: "", payment: "", support: "" }, __v: 2, publishedAt: null as string | null }, isError: false, error: null, refetch: vi.fn() },
  publicPolicy: { data: null as { content: typeof content; publishedAt: string } | null, isPending: false, isError: false },
  save: vi.fn(), create: vi.fn(),
}))
vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
vi.mock("@/features/support/hooks/use-support", () => ({
  useAdminPolicy: () => mocks.admin,
  usePolicy: () => mocks.publicPolicy,
  useSupportMutations: () => ({ savePolicy: { mutateAsync: mocks.save, isPending: false }, create: { mutateAsync: mocks.create, isPending: false } }),
  useEligibleWarrantyOrders: () => ({ isPending: false, isError: false, data: { data: [{ _id: "a".repeat(24), orderCode: "ORD-ABCDEF", items: [{ itemIndex: 0, productName: "Sản phẩm đã mua", variantName: "", quantity: 1 }] }], pagination: { totalPages: 1 } } }),
}))
beforeEach(() => {
  vi.clearAllMocks()
  mocks.admin.data = { content: { ...content }, __v: 2, publishedAt: null }
  mocks.publicPolicy.data = null
})
const wrap = (element: React.ReactNode) => <MemoryRouter>{element}</MemoryRouter>

it("unpublished public policy shows an honest empty state and warranty entry point", () => {
  render(wrap(<PolicyPage />))
  expect(screen.getByText("Chính sách đang được cập nhật")).toBeTruthy()
  expect(screen.getByRole("link", { name: /Gửi yêu cầu bảo hành/ }).getAttribute("href")).toBe("/account/warranty")
})
it("public policy renders text safely rather than injecting HTML", () => {
  mocks.publicPolicy.data = { content: { ...content, warranty: '<script>alert("x")</script>' }, publishedAt: "2026-11-01T00:00:00Z" }
  const { container } = render(wrap(<PolicyPage />))
  expect(screen.getByText('<script>alert("x")</script>')).toBeTruthy()
  expect(container.querySelector("script")).toBeNull()
})
it("background policy refresh preserves dirty text and the original expectedVersion", async () => {
  mocks.save.mockResolvedValue({ content: { ...content, warranty: "Bản đang soạn" }, __v: 3, publishedAt: null })
  const view = render(wrap(<AdminPolicyPage />))
  fireEvent.change(screen.getByLabelText("Chính sách bảo hành"), { target: { value: "Bản đang soạn" } })
  mocks.admin.data = { content: { ...content, warranty: "Bản mới từ người khác" }, __v: 9, publishedAt: null }
  view.rerender(wrap(<AdminPolicyPage />))
  expect((screen.getByLabelText("Chính sách bảo hành") as HTMLTextAreaElement).value).toBe("Bản đang soạn")
  fireEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }))
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ content: { ...content, warranty: "Bản đang soạn" }, expectedVersion: 2, publish: false }))
})
it("a version conflict retains the policy draft and locks both save actions", async () => {
  mocks.save.mockRejectedValue({ isAxiosError: true, response: { status: 409, data: { message: "Dữ liệu đã thay đổi.", code: "VERSION_CONFLICT" } } })
  render(wrap(<AdminPolicyPage />))
  fireEvent.change(screen.getByLabelText("Chính sách bảo hành"), { target: { value: "Giữ bản nháp này" } })
  fireEvent.click(screen.getByRole("button", { name: "Công bố chính sách" }))
  await waitFor(() => expect((screen.getByRole("button", { name: "Lưu bản nháp" }) as HTMLButtonElement).disabled).toBe(true))
  expect((screen.getByRole("button", { name: "Công bố chính sách" }) as HTMLButtonElement).disabled).toBe(true)
  expect((screen.getByLabelText("Chính sách bảo hành") as HTMLTextAreaElement).value).toBe("Giữ bản nháp này")
})
it("uncertain warranty submission retries the identical request and retains description", async () => {
  mocks.create.mockRejectedValueOnce(new Error("Không thể kết nối")).mockResolvedValueOnce({ _id: "b".repeat(24) })
  const onCreated = vi.fn()
  render(wrap(<WarrantyCreateForm onCreated={onCreated} onCancel={vi.fn()} />))
  fireEvent.click(screen.getByRole("radio"))
  fireEvent.change(screen.getByLabelText("Mô tả tình trạng lỗi"), { target: { value: "Sản phẩm không hoạt động" } })
  fireEvent.click(screen.getByRole("button", { name: "Gửi yêu cầu" }))
  await screen.findByText("Không thể kết nối")
  expect((screen.getByLabelText("Mô tả tình trạng lỗi") as HTMLTextAreaElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Thử gửi lại yêu cầu" }))
  await waitFor(() => expect(onCreated).toHaveBeenCalledWith("b".repeat(24)))
  expect(mocks.create.mock.calls[0][0]).toEqual(mocks.create.mock.calls[1][0])
})
it("frontend validation requires full published policy and rejects identity overrides", () => {
  expect(savePolicySchema.safeParse({ content: { ...content, warranty: " " }, publish: true, expectedVersion: 0 }).success).toBe(false)
  expect(createWarrantySchema.safeParse({ requestId: crypto.randomUUID(), orderId: "a".repeat(24), itemIndex: 0, description: "Lỗi sản phẩm", customerId: "b".repeat(24) }).success).toBe(false)
})

import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { ProductForm } from "@/features/products/components/product-form"
import { api } from "@/services/api"
import { queryClient } from "@/services/query-client"
import type { Product } from "@/features/products/types/products"
const original = api.defaults.adapter
vi.mock("@/features/products/components/product-description-editor", () => ({ ProductDescriptionEditor: ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) => <textarea id="description" aria-label="Mô tả" value={value} disabled={disabled} onChange={event => onChange(event.target.value)} /> }))
const id = "a".repeat(24)
const product: Product = { _id: id, product_name: "Phone case", category: { _id: id, name: "Cases" }, brand: { _id: id, name: "Thương hiệu" }, model_year: 2026, variants: [{ _id: "b".repeat(24), sku: "CASE-1", price: 100, stock: 2, attributes: { warranty: 12, wireless: false } }] }
beforeEach(() => {
  queryClient.clear()
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [{ _id: id, name: config.url === "/categories" ? "Cases" : "Thương hiệu", isActive: true }] } })
})
afterEach(() => { api.defaults.adapter = original; queryClient.clear() })
function wrap(children: ReactNode) { return render(<QueryClientProvider client={queryClient}><RouterProvider router={createMemoryRouter([{ path: "*", element: children }])} /></QueryClientProvider>) }
it("edits shipping metadata, dimensions and tags without resending inventory or import provenance", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  wrap(<ProductForm product={{ ...product, sku: "CASE-NEW", tags: ["Case"], source: "dummyjson" }} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  for (const [label, value] of [["Khối lượng (kg)", "2"], ["Chiều rộng (cm)", "10"], ["Chiều cao (cm)", "20"], ["Chiều sâu (cm)", "3"], ["Thông tin bảo hành", "12 tháng"], ["Nhãn 1", "New case"]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
  }
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toEqual({ weight: 2, dimensions: { width: 10, height: 20, depth: 3 }, warrantyInformation: "12 tháng", tags: ["New case"] })
})
it.each([
  ["Tồn kho biến thể", "-5", "Tồn kho biến thể không được âm."],
  ["Tồn kho biến thể", "1.5", "Tồn kho biến thể phải là số nguyên."],
  ["Giá biến thể", "-1", "Giá biến thể không được âm."],
  ["Giá so sánh", "-1", "Giá so sánh không được âm."],
  ["Giảm giá (%)", "71", "Mức giảm giá không được vượt quá 70%."],
  ["Năm sản xuất", "1899", "Năm sản xuất phải từ 1900 trở đi."],
])("shows a useful error next to %s when its value is %s", async (label, value, message) => {
  const save = vi.fn()
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  const input = screen.getByLabelText(label)
  fireEvent.change(input, { target: { value } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  const error = await screen.findByText(message)
  expect(input.getAttribute("aria-invalid")).toBe("true")
  expect(input.getAttribute("aria-describedby")).toBe(error.id)
  expect(save).not.toHaveBeenCalled()
  expect(screen.queryByText(/Too small:|Too big:|Invalid input:/)).toBeNull()
})
it("loads catalog data and submits retained variants with typed options", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  expect(screen.getByText("Được tính từ tồn kho của các biến thể.")).toBeTruthy()
  fireEvent.change(screen.getByLabelText("Tên sản phẩm"), { target: { value: "Updated case" } })
  fireEvent.change(screen.getByLabelText("Giá biến thể"), { target: { value: "120" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toMatchObject({ product_name: "Updated case", variants: [{ _id: "b".repeat(24), price: 120, attributes: { warranty: 12, wireless: false } }] })
  expect(save.mock.calls[0][0]).not.toHaveProperty("category")
  expect(save.mock.calls[0][0]).not.toHaveProperty("brand")
  expect(save.mock.calls[0][0]).not.toHaveProperty("stock")
})
it("validates fields and supports adding and removing variants", async () => {
  const save = vi.fn()
  wrap(<ProductForm save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Thêm biến thể" }))
  expect(screen.getByLabelText("SKU")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Tạo sản phẩm" }))
  await waitFor(() => expect(screen.getByLabelText("SKU").getAttribute("aria-invalid")).toBe("true"))
  expect(save).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Xóa biến thể 1" }))
  expect(screen.queryByLabelText("SKU")).toBeNull()
})
it("displays backend validation errors under the matching variant field", async () => {
  const save = vi.fn().mockRejectedValue(new AxiosError("Invalid", "ERR_BAD_REQUEST", undefined, undefined, {
    config: { headers: new AxiosHeaders() }, headers: new AxiosHeaders(), status: 400, statusText: "Bad request",
    data: { message: "Validation failed", errors: [{ field: "body.variants.0.sku", message: "SKU is already used" }] },
  }))
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "CASE-2" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(screen.getByLabelText("SKU").getAttribute("aria-invalid")).toBe("true"))
  expect(document.getElementById("variants.0.sku-error")?.textContent).toBe("SKU is already used")
})
it("submits only a changed description even when the original category is inactive", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: {
    data: config.url === "/categories" ? [{ _id: id, name: "Cases", isActive: false }] : [{ _id: id, name: "Thương hiệu", isActive: true }],
  } })
  wrap(<ProductForm product={{ ...product, slug: "custom-case" }} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: "New description" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toEqual({ description: "New description" })
})
it("does not send an empty update when saving an untouched form", async () => {
  const save = vi.fn()
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(screen.queryByRole("button", { name: "Lưu thay đổi" })?.hasAttribute("disabled")).toBe(false))
  expect(save).not.toHaveBeenCalled()
})
it("keeps nullable typed attributes untouched during an unrelated edit", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  const nullableProduct = { ...product, variants: [{ ...product.variants![0], attributes: { wireless: false, warranty: 12, nullable: null } }] }
  wrap(<ProductForm product={nullableProduct} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Mô tả"), { target: { value: "New description" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toEqual({ description: "New description" })
})
it("sends null when an existing compare-at price is cleared", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  wrap(<ProductForm product={{ ...product, variants: [{ ...product.variants![0], compare_at_price: 150 }] }} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Đang tải danh mục và thương hiệu…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Giá so sánh"), { target: { value: "" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  const payload = JSON.parse(JSON.stringify(save.mock.calls[0][0]))
  expect(payload.variants[0].compare_at_price).toBeNull()
})


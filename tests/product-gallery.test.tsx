import { beforeEach, afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { ProductGallery } from "@/features/products/components/product-gallery"
import { queryClient } from "@/services/query-client"
import { api } from "@/services/api"
import type { Product } from "@/features/products/types/products"
const originalAdapter = api.defaults.adapter
const product: Product = { _id: "a".repeat(24), product_name: "Case", category: null, brand: null, model_year: 2026, images: [{ public_id: "folder/image", secure_url: "https://images.test/image.png" }] }
beforeEach(() => {
  queryClient.clear()
  vi.stubGlobal("URL", class extends URL { static createObjectURL = vi.fn(() => "blob:preview"); static revokeObjectURL = vi.fn() })
})
afterEach(() => { api.defaults.adapter = originalAdapter; queryClient.clear(); vi.unstubAllGlobals() })
function setup(value = product) { return render(<QueryClientProvider client={queryClient}><ProductGallery product={value} /></QueryClientProvider>) }
it("rejects unsupported files and uploads a valid image using the multipart image field", async () => {
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    writes(config.url, config.data)
    return { config, headers: new AxiosHeaders(), status: 201, statusText: "Ngày tạo", data: { data: product } }
  }
  const { unmount } = setup()
  fireEvent.change(screen.getByLabelText("Chọn ảnh sản phẩm"), { target: { files: [new File(["bad"], "bad.svg", { type: "image/svg+xml" })] } })
  expect(await screen.findByRole("alert")).toBeTruthy()
  expect(writes).not.toHaveBeenCalled()
  const file = new File(["image"], "case.png", { type: "image/png" })
  fireEvent.change(screen.getByLabelText("Chọn ảnh sản phẩm"), { target: { files: [file] } })
  expect(screen.getByAltText("Xem trước ảnh đã chọn")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Tải ảnh lên" }))
  await waitFor(() => expect(writes).toHaveBeenCalledOnce())
  expect(writes.mock.calls[0][0]).toBe(`/products/${product._id}/images`)
  expect(writes.mock.calls[0][1].get("image")).toBe(file)
  await waitFor(() => expect(screen.queryByAltText("Xem trước ảnh đã chọn")).toBeNull())
  unmount()
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview")
})
it("requires confirmation and keeps gallery images visible after a server conflict", async () => {
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    writes(config.url)
    throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, { config, headers: new AxiosHeaders(), status: 409, statusText: "Conflict", data: { message: "Remove this image from variants before deleting it from the gallery" } })
  }
  setup()
  fireEvent.click(screen.getByLabelText("Xóa ảnh thư viện folder/image"))
  expect(writes).not.toHaveBeenCalled()
  fireEvent.click(await screen.findByRole("button", { name: "Xác nhận xóa ảnh" }))
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Remove this image from variants before deleting it from the gallery")
  expect(writes).toHaveBeenCalledWith(`/products/${product._id}/images/folder%2Fimage`)
  expect(screen.getByAltText("Case")).toBeTruthy()
})
it("disables uploads when the gallery has eight images", () => {
  setup({ ...product, images: Array.from({ length: 8 }, (_, index) => ({ public_id: `folder/${index}`, secure_url: `https://images.test/${index}.png` })) })
  expect(screen.getByLabelText("Chọn ảnh sản phẩm").hasAttribute("disabled")).toBe(true)
  expect(screen.getByText("Thư viện ảnh đã đầy. Hãy xóa một ảnh trước khi tải ảnh mới.")).toBeTruthy()
})

import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { ProductForm } from "@/components/products/product-form"
import { api } from "@/services/api"
import { queryClient } from "@/lib/query-client"
import type { Product } from "@/types/products"
const original = api.defaults.adapter
vi.mock("@/components/products/product-description-editor", () => ({ ProductDescriptionEditor: ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) => <textarea id="description" aria-label="Description" value={value} disabled={disabled} onChange={event => onChange(event.target.value)} /> }))
const id = "a".repeat(24)
const product: Product = { _id: id, product_name: "Phone case", category: { _id: id, name: "Cases" }, brand: { _id: id, name: "Brand" }, model_year: 2026, variants: [{ _id: "b".repeat(24), sku: "CASE-1", price: 100, stock: 2, attributes: { warranty: 12, wireless: false } }] }
beforeEach(() => {
  queryClient.clear()
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [{ _id: id, name: config.url === "/categories" ? "Cases" : "Brand", isActive: true }] } })
})
afterEach(() => { api.defaults.adapter = original; queryClient.clear() })
function wrap(children: ReactNode) { return render(<QueryClientProvider client={queryClient}><RouterProvider router={createMemoryRouter([{ path: "*", element: children }])} /></QueryClientProvider>) }
it("loads catalog data and submits retained variants with typed options", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  expect(screen.getByText("Calculated from variant stock.")).toBeTruthy()
  fireEvent.change(screen.getByLabelText("Product name"), { target: { value: "Updated case" } })
  fireEvent.change(screen.getByLabelText("Variant price"), { target: { value: "120" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toMatchObject({ product_name: "Updated case", variants: [{ _id: "b".repeat(24), price: 120, attributes: { warranty: 12, wireless: false } }] })
  expect(save.mock.calls[0][0]).not.toHaveProperty("category")
  expect(save.mock.calls[0][0]).not.toHaveProperty("brand")
  expect(save.mock.calls[0][0]).not.toHaveProperty("stock")
})
it("validates fields and supports adding and removing variants", async () => {
  const save = vi.fn()
  wrap(<ProductForm save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Add variant" }))
  expect(screen.getByLabelText("SKU")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Create product" }))
  await waitFor(() => expect(screen.getByLabelText("SKU").getAttribute("aria-invalid")).toBe("true"))
  expect(save).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Remove variant 1" }))
  expect(screen.queryByLabelText("SKU")).toBeNull()
})
it("displays backend validation errors under the matching variant field", async () => {
  const save = vi.fn().mockRejectedValue(new AxiosError("Invalid", "ERR_BAD_REQUEST", undefined, undefined, {
    config: { headers: new AxiosHeaders() }, headers: new AxiosHeaders(), status: 400, statusText: "Bad request",
    data: { message: "Validation failed", errors: [{ field: "body.variants.0.sku", message: "SKU is already used" }] },
  }))
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.change(screen.getByLabelText("SKU"), { target: { value: "CASE-2" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(screen.getByLabelText("SKU").getAttribute("aria-invalid")).toBe("true"))
  expect(document.getElementById("variants.0.sku-error")?.textContent).toBe("SKU is already used")
})
it("submits only a changed description even when the original category is inactive", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: {
    data: config.url === "/categories" ? [{ _id: id, name: "Cases", isActive: false }] : [{ _id: id, name: "Brand", isActive: true }],
  } })
  wrap(<ProductForm product={{ ...product, slug: "custom-case" }} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New description" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toEqual({ description: "New description" })
})
it("does not send an empty update when saving an untouched form", async () => {
  const save = vi.fn()
  wrap(<ProductForm product={product} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(screen.queryByRole("button", { name: "Save changes" })?.hasAttribute("disabled")).toBe(false))
  expect(save).not.toHaveBeenCalled()
})
it("keeps nullable typed attributes untouched during an unrelated edit", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  const nullableProduct = { ...product, variants: [{ ...product.variants![0], attributes: { wireless: false, warranty: 12, nullable: null } }] }
  wrap(<ProductForm product={nullableProduct} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New description" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  expect(save.mock.calls[0][0]).toEqual({ description: "New description" })
})
it("sends null when an existing compare-at price is cleared", async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  wrap(<ProductForm product={{ ...product, variants: [{ ...product.variants![0], compare_at_price: 150 }] }} save={save} pending={false} />)
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.change(screen.getByLabelText("Compare at price"), { target: { value: "" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  const payload = JSON.parse(JSON.stringify(save.mock.calls[0][0]))
  expect(payload.variants[0].compare_at_price).toBeNull()
})


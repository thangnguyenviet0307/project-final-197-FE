import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import ProductEditPage from "@/pages/admin/products/edit"
import { api } from "@/services/api"
import { queryClient } from "@/services/query-client"
import type { Product } from "@/features/products/types/products"

vi.mock("@/layout/admin/base-layout", () => ({ BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main> }))
const adapter = api.defaults.adapter
vi.mock("@/features/products/components/product-description-editor", () => ({ ProductDescriptionEditor: ({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled: boolean }) => <textarea id="description" aria-label="Description" value={value} disabled={disabled} onChange={event => onChange(event.target.value)} /> }))
const id = "a".repeat(24)
const original: Product = { _id: id, product_name: "Phone case", slug: "custom-case", category: { _id: id, name: "Cases" }, brand: { _id: id, name: "Brand" }, model_year: 2026, price: 150, stock: 10,
  variants: [{ _id: "b".repeat(24), sku: "CASE-1", price: 100, stock: 10 }] }
beforeEach(() => queryClient.clear())
afterEach(() => { api.defaults.adapter = adapter; queryClient.clear() })

function setup(latest: Product) {
  let reads = 0
  const writes = vi.fn()
  api.defaults.adapter = async config => {
    let data: unknown
    if (config.method === "put") { writes(JSON.parse(config.data)); data = original }
    else if (config.url === `/products/${id}`) { reads++; data = reads === 1 ? original : latest }
    else data = [{ _id: id, name: config.url === "/categories" ? "Cases" : "Brand", isActive: true }]
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data } }
  }
  render(<QueryClientProvider client={queryClient}><RouterProvider router={createMemoryRouter([
    { path: "/products/:id/edit", element: <ProductEditPage /> },
    { path: "/products/:id", element: <p>Saved product detail</p> },
  ], { initialEntries: [`/products/${id}/edit`] })} /></QueryClientProvider>)
  return writes
}

it("blocks an inventory edit if stock changed after the form was opened", async () => {
  const writes = setup({ ...original, stock: 8, variants: [{ ...original.variants![0], stock: 8 }] })
  fireEvent.change(await screen.findByLabelText("Variant stock"), { target: { value: "9" } })
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Product inventory or variants changed while you were editing. Reload this page and review the latest data before saving.")
  expect(writes).not.toHaveBeenCalled()
  expect((screen.getByLabelText("Variant stock") as HTMLInputElement).value).toBe("9")
})

it("saves a variant edit with IDs and the explicit product price when inventory is unchanged", async () => {
  const writes = setup(original)
  fireEvent.change(await screen.findByLabelText("Variant stock"), { target: { value: "9" } })
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  expect(await screen.findByText("Saved product detail")).toBeTruthy()
  expect(writes).toHaveBeenCalledOnce()
  expect(writes.mock.calls[0][0]).toEqual({ expectedVersion: 0, price: 150, variants: [{ ...original.variants![0], stock: 9, variant_name: null, images: [], attributes: {}, color: "", size: "", image: "" }] })
})

it("saves a description without overwriting inventory changed by another editor", async () => {
  const writes = setup({ ...original, stock: 8, variants: [{ ...original.variants![0], stock: 8 }] })
  fireEvent.change(await screen.findByLabelText("Description"), { target: { value: "New description" } })
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  expect(await screen.findByText("Saved product detail")).toBeTruthy()
  expect(writes).toHaveBeenCalledWith({ description: "New description" })
})

it("preserves unsaved form values through a failed background refetch and a successful retry", async () => {
  setup(original)
  const description = await screen.findByLabelText("Description")
  await waitFor(() => expect(screen.queryByText("Loading categories and brands…")).toBeNull())
  fireEvent.change(description, { target: { value: "My unsaved description" } })
  const workingAdapter = api.defaults.adapter
  api.defaults.adapter = async () => { throw new Error("Refresh unavailable") }
  await act(async () => { await queryClient.invalidateQueries({ queryKey: ["products", "detail", id] }) })
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", expect.stringContaining("Your unsaved changes are preserved"))
  expect(screen.getByLabelText("Description")).toBe(description)
  expect((description as HTMLTextAreaElement).value).toBe("My unsaved description")
  api.defaults.adapter = workingAdapter
  fireEvent.click(screen.getByRole("button", { name: "Retry refresh" }))
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull())
  expect(screen.getByLabelText("Description")).toBe(description)
  expect((description as HTMLTextAreaElement).value).toBe("My unsaved description")
})

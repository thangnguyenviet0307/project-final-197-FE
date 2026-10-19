import { afterEach, expect, it } from "vitest"
import { AxiosHeaders } from "axios"
import { api } from "@/services/api"
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct, getProductStatistics } from "@/features/products/services/products.service"
const original = api.defaults.adapter
afterEach(() => { api.defaults.adapter = original })
it("uses the existing products contract for pagination and CRUD", async () => {
  const calls: { method?: string; url?: string; body: unknown; params: unknown; signal: unknown }[] = []
  api.defaults.adapter = async config => {
    calls.push({ method: config.method, url: config.url, body: config.data ? JSON.parse(config.data) : undefined, params: config.params, signal: config.signal })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: config.url === "/products" && config.method === "get" ? [] : { _id: "id" }, pagination: { page: 2, limit: 10, total: 11, totalPages: 2 } } }
  }
  const signal = new AbortController().signal
  expect((await listProducts({ page: 2, limit: 10 }, signal)).pagination.total).toBe(11)
  await getProduct("id", signal)
  const input = { product_name: "Case", category: "a".repeat(24), brand: "b".repeat(24), model_year: 2026 }
  await createProduct(input)
  await updateProduct({ id: "id", input })
  await deleteProduct("id")
  expect(calls.map(({ method, url }) => [method, url])).toEqual([["get", "/products"], ["get", "/products/id"], ["post", "/products"], ["put", "/products/id"], ["delete", "/products/id"]])
  expect(calls[0]).toMatchObject({ params: { page: 2, limit: 10 }, signal })
  expect(calls[3].body).toEqual(input)
})
it("passes price, catalog and sorting filters to the server and reads global statistics", async () => {
  const requests: { url?: string; params: unknown }[] = []
  api.defaults.adapter = async config => {
    requests.push({ url: config.url, params: config.params })
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: config.url === "/products/statistics"
      ? { data: { total: 30, active: 20, outOfStock: 4, stockUnits: 150 } }
      : { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } }
  }
  const params = { page: 1, limit: 20, search: "Case", category: "a".repeat(24), brand: "b".repeat(24), minPrice: 0, maxPrice: 100, sortBy: "price" as const, sortOrder: "asc" as const }
  await listProducts(params)
  expect(requests[0]).toEqual({ url: "/products", params })
  expect(await getProductStatistics()).toEqual({ total: 30, active: 20, outOfStock: 4, stockUnits: 150 })
})

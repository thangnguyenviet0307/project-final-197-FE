import { expect, it, vi } from "vitest"
import { listStoreProducts, getStoreProduct } from "@/features/storefront/services/catalog.service"
import { authApi } from "@/services/api"

vi.mock("@/services/api", () => ({ authApi: { get: vi.fn() } }))

it("reads anonymous Backend catalog with server pagination and an encoded detail slug", async () => {
  const pagination = { page: 2, limit: 12, total: 20, totalPages: 2 }
  vi.mocked(authApi.get).mockResolvedValueOnce({ data: { data: [], pagination } })
  const result = await listStoreProducts({ page: 2, limit: 12, search: "Chicken" })
  expect(authApi.get).toHaveBeenLastCalledWith("/products/public", { params: { page: 2, limit: 12, search: "Chicken" }, signal: undefined })
  expect(result.pagination).toEqual(pagination)
  vi.mocked(authApi.get).mockResolvedValueOnce({ data: { data: { slug: "ceramic/chicken" } } })
  expect(await getStoreProduct("ceramic/chicken")).toEqual({ slug: "ceramic/chicken" })
  expect(authApi.get).toHaveBeenLastCalledWith("/products/public/ceramic%2Fchicken", { signal: undefined })
})

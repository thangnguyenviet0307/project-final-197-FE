import { StrictMode, type ReactNode } from "react"
import { beforeEach, expect, it, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useRecordProductView } from "@/features/storefront/hooks/use-record-product-view"
import { recordProductView } from "@/features/storefront/services/catalog.service"
vi.mock("@/features/storefront/services/catalog.service", () => ({ recordProductView: vi.fn() }))
beforeEach(() => { vi.mocked(recordProductView).mockReset(); vi.mocked(recordProductView).mockResolvedValue({ count_view: 12 }) })
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => <StrictMode><QueryClientProvider client={client}>{children}</QueryClientProvider></StrictMode>
  return { client, wrapper }
}
it("counts a successful navigation once despite StrictMode and background renders, then counts the next visit", async () => {
  const { client, wrapper } = setup()
  client.setQueryData(["products", "public", "detail", "case"], { product_name: "Case", count_view: 11 })
  const invalidate = vi.spyOn(client, "invalidateQueries")
  const view = renderHook(({ enabled, visit }) => useRecordProductView("case", enabled, visit), { wrapper, initialProps: { enabled: false, visit: "first" } })
  expect(recordProductView).not.toHaveBeenCalled()
  view.rerender({ enabled: true, visit: "first" })
  await waitFor(() => expect(recordProductView).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(client.getQueryData(["products", "public", "detail", "case"])).toMatchObject({ count_view: 12 }))
  expect(invalidate).toHaveBeenCalled()
  view.rerender({ enabled: true, visit: "first" })
  expect(recordProductView).toHaveBeenCalledTimes(1)
  view.rerender({ enabled: true, visit: "second" })
  await waitFor(() => expect(recordProductView).toHaveBeenCalledTimes(2))
})
it("does not double-count an initial StrictMode mount or retry a failed write", async () => {
  const { wrapper } = setup()
  vi.mocked(recordProductView).mockRejectedValue(new Error("Offline"))
  const view = renderHook(() => useRecordProductView("case", true, "first"), { wrapper })
  await waitFor(() => expect(recordProductView).toHaveBeenCalledTimes(1))
  view.rerender()
  expect(recordProductView).toHaveBeenCalledTimes(1)
})

import { afterEach, expect, it } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import { useDeleteProduct } from "@/features/products/hooks/use-delete-product"
import { useProductStatistics } from "@/features/products/hooks/use-product-statistics"
import { queryClient } from "@/services/query-client"
import { api } from "@/services/api"

const adapter = api.defaults.adapter
afterEach(() => { api.defaults.adapter = adapter; queryClient.clear() })
function Statistics() {
  const stats = useProductStatistics()
  const mutation = useDeleteProduct()
  return <><output data-testid="total">{stats.data?.total}</output><button onClick={() => mutation.mutate("a".repeat(24))}>Xóa</button></>
}
it("refetches active statistics after successful deletion", async () => {
  queryClient.clear()
  let deleted = false
  let statsReads = 0
  api.defaults.adapter = async config => {
    if (config.method === "delete") deleted = true
    if (config.url === "/products/statistics") statsReads++
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: { total: deleted ? 9 : 10, active: 5, stockUnits: 20, outOfStock: 2 } } }
  }
  render(<QueryClientProvider client={queryClient}><Statistics /></QueryClientProvider>)
  await waitFor(() => expect(screen.getByTestId("total").textContent).toBe("10"))
  fireEvent.click(screen.getByRole("button", { name: "Xóa" }))
  await waitFor(() => expect(screen.getByTestId("total").textContent).toBe("9"))
  expect(statsReads).toBe(2)
})

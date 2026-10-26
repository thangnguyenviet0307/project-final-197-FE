import { afterEach, expect, it } from "vitest"
import { render, screen, within, waitFor, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AxiosError, AxiosHeaders } from "axios"
import { OrderStatistics } from "@/features/orders/components/order-statistics"
import { api } from "@/services/api"

const original = api.defaults.adapter
afterEach(() => { api.defaults.adapter = original })
it("counts all orders by status using metadata and refreshes after order invalidation", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const requests: unknown[] = []
  let multiplier = 10
  api.defaults.adapter = async config => {
    requests.push(config.params)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: config.params.orderStatus * multiplier } } }
  }
  render(<QueryClientProvider client={client}><OrderStatistics /></QueryClientProvider>)
  const section = screen.getByRole("region", { name: "Thống kê đơn hàng" })
  await within(section).findByText("100")
  expect(requests).toHaveLength(4)
  expect(requests).toEqual(expect.arrayContaining([1, 2, 3, 4].map(orderStatus => ({ page: 1, limit: 1, orderStatus }))))
  for (const value of [10, 20, 30, 40]) expect(within(section).getByText(String(value))).toBeTruthy()
  multiplier = 20
  await client.invalidateQueries({ queryKey: ["orders"] })
  await within(section).findByText("200")
  client.clear()
})
it("does not display zero for failed statistics and supports retry", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let fail = true
  api.defaults.adapter = async config => {
    if (fail) throw new AxiosError("Offline", "ERR_NETWORK", config)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: 0 } } }
  }
  render(<QueryClientProvider client={client}><OrderStatistics /></QueryClientProvider>)
  await screen.findByRole("alert")
  expect(screen.queryByText("0")).toBeNull()
  fail = false
  fireEvent.click(screen.getByRole("button", { name: "Tải lại thống kê" }))
  await waitFor(() => expect(screen.getAllByText("0")).toHaveLength(5))
  client.clear()
})

import type { ReactNode } from "react"
import { afterEach, expect, it } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { AxiosError, AxiosHeaders } from "axios"
import { authApi } from "@/services/api"
import { useStoreFilterCount } from "@/features/storefront/hooks/use-store-filter-count"
const adapter = authApi.defaults.adapter
const clients: QueryClient[] = []
afterEach(() => { authApi.defaults.adapter = adapter; clients.forEach(client => client.clear()); clients.length = 0 })
function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } }); clients.push(client)
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
it("counts the current draft using server metadata and avoids requests while closed", async () => {
  const requests: unknown[] = []
  authApi.defaults.adapter = async config => {
    requests.push(config.params)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: config.params.brand ? 7 : 23, totalPages: 1 } } }
  }
  const hook = renderHook(({ brand, enabled }: { brand?: string; enabled: boolean }) => useStoreFilterCount({ brand, search: "cable" }, enabled), { initialProps: { brand: undefined as string | undefined, enabled: false }, wrapper: wrapper() })
  expect(requests).toHaveLength(0)
  hook.rerender({ brand: "a".repeat(24), enabled: true })
  await waitFor(() => expect(hook.result.current.data).toBe(7))
  expect(requests[0]).toEqual({ brand: "a".repeat(24), search: "cable", page: 1, limit: 1 })
  hook.rerender({ brand: undefined, enabled: true })
  await waitFor(() => expect(hook.result.current.data).toBe(23))
})
it("reports count failures instead of presenting zero results", async () => {
  authApi.defaults.adapter = async config => { throw new AxiosError("Offline", "ERR_NETWORK", config) }
  const hook = renderHook(() => useStoreFilterCount({}, true), { wrapper: wrapper() })
  await waitFor(() => expect(hook.result.current.isError).toBe(true))
  expect(hook.result.current.data).toBeUndefined()
})

it("coalesces rapid selections and blocks confirmation while the latest count is pending", async () => {
  const requests: { brand?: string }[] = []
  authApi.defaults.adapter = async config => {
    requests.push(config.params)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: { data: [], pagination: { total: config.params.brand ? 7 : 23, totalPages: 1 } } }
  }
  const hook = renderHook(({ brand, enabled }: { brand?: string; enabled: boolean }) => useStoreFilterCount({ brand }, enabled), {
    initialProps: { brand: undefined as string | undefined, enabled: true }, wrapper: wrapper(),
  })
  await waitFor(() => expect(hook.result.current.data).toBe(23))
  hook.rerender({ brand: "a".repeat(24), enabled: true })
  expect(hook.result.current.isFetching).toBe(true)
  hook.rerender({ brand: ["a".repeat(24), "b".repeat(24)].join(","), enabled: true })
  expect(requests).toHaveLength(1)
  await waitFor(() => expect(hook.result.current.isFetching).toBe(false))
  expect(requests).toHaveLength(2)
  expect(requests[1].brand).toBe(["a".repeat(24), "b".repeat(24)].join(","))
  hook.rerender({ brand: "c".repeat(24), enabled: true })
  hook.rerender({ brand: "c".repeat(24), enabled: false })
  // A closed popup must cancel its pending debounce, including after the delay.
  await new Promise(resolve => setTimeout(resolve, 220))
  expect(requests).toHaveLength(2)
})

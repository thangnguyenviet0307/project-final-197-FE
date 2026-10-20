import { afterEach, expect, it, vi } from "vitest"
import { waitFor } from "@testing-library/react"
import { focusManager, onlineManager, QueryClient, QueryObserver } from "@tanstack/react-query"
import { publishBusinessChange, subscribeToBusinessChanges } from "@/services/data-sync"
import { queryClient } from "@/services/query-client"

const cleanups: (() => void)[] = []
afterEach(() => { cleanups.splice(0).reverse().forEach(stop => stop()); vi.restoreAllMocks(); localStorage.removeItem("admin-data-updated") })

async function activeProduct() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } })
  const read = vi.fn(async () => ({ name: `Product ${read.mock.calls.length}` }))
  const observer = new QueryObserver(client, { queryKey: ["products", "detail", "id"], queryFn: read })
  const stop = observer.subscribe(() => {})
  cleanups.push(() => { stop(); client.clear() })
  await waitFor(() => expect(client.getQueryData(["products", "detail", "id"])).toEqual({ name: "Product 1" }))
  return { client, read }
}

it("refetches fresh mounted data after another tab changes data without reloading the page", async () => {
  const { client, read } = await activeProduct()
  client.setQueryData(["orders", "list"], [])
  client.setQueryData(["auth", "me"], { id: "user" })
  cleanups.push(subscribeToBusinessChanges(client))
  window.dispatchEvent(new StorageEvent("storage", { key: "admin-data-updated", newValue: JSON.stringify({ type: "business-data-changed", id: "other-tab" }) }))
  await waitFor(() => expect(client.getQueryData(["products", "detail", "id"])).toEqual({ name: "Product 2" }))
  expect(read).toHaveBeenCalledTimes(2)
  expect(client.getQueryState(["orders", "list"])?.isInvalidated).toBe(true)
  expect(client.getQueryState(["auth", "me"])?.isInvalidated).toBe(false)
})

it("refreshes API data retained by Fast Refresh and cleans up HMR listeners", async () => {
  const { client } = await activeProduct()
  let updated = () => {}
  const hot = { on: vi.fn((_event: "vite:afterUpdate", callback: () => void) => { updated = callback }), off: vi.fn() }
  const stop = subscribeToBusinessChanges(client, hot)
  cleanups.push(stop)
  updated()
  await waitFor(() => expect(client.getQueryData(["products", "detail", "id"])).toEqual({ name: "Product 2" }))
  stop()
  expect(hot.off).toHaveBeenCalledWith("vite:afterUpdate", updated)
})

it("ignores invalid and unrelated storage events", async () => {
  const { client, read } = await activeProduct()
  cleanups.push(subscribeToBusinessChanges(client))
  window.dispatchEvent(new StorageEvent("storage", { key: "admin-data-updated", newValue: "invalid json" }))
  window.dispatchEvent(new StorageEvent("storage", { key: "unrelated", newValue: JSON.stringify({ type: "business-data-changed", id: "id" }) }))
  window.dispatchEvent(new StorageEvent("storage", { key: "admin-data-updated", newValue: JSON.stringify({ type: "something-else", id: "id" }) }))
  await new Promise(resolve => setTimeout(resolve, 80))
  expect(read).toHaveBeenCalledTimes(1)
})

it("publishes no business data or credentials and tolerates unavailable storage", () => {
  publishBusinessChange()
  expect(JSON.parse(localStorage.getItem("admin-data-updated")!)).toEqual({ type: "business-data-changed", id: expect.any(String) })
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage denied") })
  expect(() => publishBusinessChange()).not.toThrow()
})

it("revalidates fresh data on navigation, focus and reconnect", async () => {
  const client = new QueryClient({ defaultOptions: queryClient.getDefaultOptions() })
  client.mount()
  client.setQueryData(["products", "live"], "cached")
  let revision = 0
  const read = vi.fn(async () => `revision ${++revision}`)
  const observer = new QueryObserver(client, { queryKey: ["products", "live"], queryFn: read })
  const stop = observer.subscribe(() => {})
  cleanups.push(() => { stop(); client.unmount(); client.clear(); focusManager.setFocused(undefined); onlineManager.setOnline(true) })
  await waitFor(() => expect(observer.getCurrentResult().data).toBe("revision 1"))
  focusManager.setFocused(false)
  focusManager.setFocused(true)
  await waitFor(() => expect(observer.getCurrentResult().data).toBe("revision 2"))
  onlineManager.setOnline(false)
  onlineManager.setOnline(true)
  await waitFor(() => expect(observer.getCurrentResult().data).toBe("revision 3"))
  expect(read).toHaveBeenCalledTimes(3)
})

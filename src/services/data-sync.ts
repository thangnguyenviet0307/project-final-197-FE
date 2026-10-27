import type { QueryClient } from "@tanstack/react-query"

const storageKey = "admin-data-updated"
const businessKeys = ["products", "orders", "categories", "brands", "users", "customers", "hero-slides"] as const

interface HotUpdates {
  on: (event: "vite:afterUpdate", callback: () => void) => void
  off: (event: "vite:afterUpdate", callback: () => void) => void
}

// Send only a change signal, never API responses, credentials or personal data.
export function publishBusinessChange() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({ type: "business-data-changed", id: crypto.randomUUID() }))
  } catch {
    // Storage can be unavailable in private/restricted browsers; CRUD must still succeed.
  }
}

export function subscribeToBusinessChanges(client: QueryClient, hot?: HotUpdates) {
  if (typeof window === "undefined") return () => {}
  let timer: ReturnType<typeof setTimeout> | undefined
  const refresh = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
      // Mark inactive views stale; only fetch data for mounted views.
      void Promise.all(businessKeys.map(key => client.invalidateQueries({ queryKey: [key], refetchType: "active" })))
    }, 50)
  }
  const receive = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return
    try {
      const signal: unknown = JSON.parse(event.newValue)
      if (typeof signal === "object" && signal !== null && "type" in signal && signal.type === "business-data-changed" && "id" in signal && typeof signal.id === "string") refresh()
    } catch {
      // Ignore unrelated or malformed storage values.
    }
  }
  window.addEventListener("storage", receive)
  // Fast Refresh preserves React Query's cache. Re-read API data after code updates.
  hot?.on("vite:afterUpdate", refresh)
  return () => {
    window.removeEventListener("storage", receive)
    hot?.off("vite:afterUpdate", refresh)
    if (timer !== undefined) clearTimeout(timer)
  }
}

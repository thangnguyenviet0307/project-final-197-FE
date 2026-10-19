import type { QueryClient } from "@tanstack/react-query"

export function invalidateCatalog(client: QueryClient, catalog: "categories" | "brands") {
  return Promise.all([
    client.invalidateQueries({ queryKey: [catalog] }),
    client.invalidateQueries({ queryKey: ["products"] }),
  ])
}

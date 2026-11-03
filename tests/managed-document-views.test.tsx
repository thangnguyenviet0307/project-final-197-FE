import { StrictMode } from "react"
import { render, waitFor } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useDocumentView } from "@/features/support/hooks/use-managed-documents"

const record = vi.hoisted(() => vi.fn().mockResolvedValue({ views: 8 }))
vi.mock("@/features/support/services/managed-document.service", () => ({ recordDocumentView: record }))
function Visit({ visit, enabled }: { visit: string; enabled: boolean }) { useDocumentView("privacy", enabled, visit); return null }
it("records one view per successful navigation, skips refetch/StrictMode replays and updates the cached count", async () => {
  const client = new QueryClient()
  client.setQueryData(["support", "documents", "public", "privacy"], { content: "Public", views: 7 })
  const wrap = (visit: string, enabled: boolean) => <StrictMode><QueryClientProvider client={client}><Visit visit={visit} enabled={enabled} /></QueryClientProvider></StrictMode>
  const view = render(wrap("first", false))
  expect(record).not.toHaveBeenCalled()
  view.rerender(wrap("first", true))
  await waitFor(() => expect(record).toHaveBeenCalledTimes(1))
  view.rerender(wrap("first", true))
  expect(record).toHaveBeenCalledTimes(1)
  await waitFor(() => expect(client.getQueryData<{ views: number }>(["support", "documents", "public", "privacy"])?.views).toBe(8))
  view.rerender(wrap("second", true))
  await waitFor(() => expect(record).toHaveBeenCalledTimes(2))
})

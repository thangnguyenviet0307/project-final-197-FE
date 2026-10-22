import { afterEach, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { queryClient } from "@/services/query-client"

afterEach(() => { queryClient.clear(); vi.restoreAllMocks() })

it("suppresses global error toasts for queries that render their own error state", async () => {
  const notify = vi.spyOn(toast, "error").mockReturnValue("toast")
  await expect(queryClient.fetchQuery({ queryKey: ["storefront", "test-error"], meta: { suppressGlobalErrorToast: true }, queryFn: async () => { throw new Error("Product not found") } })).rejects.toThrow("Product not found")
  expect(notify).not.toHaveBeenCalled()
})

it("retains global notifications for other queries", async () => {
  const notify = vi.spyOn(toast, "error").mockReturnValue("toast")
  await expect(queryClient.fetchQuery({ queryKey: ["admin", "test-error"], queryFn: async () => { throw new Error("Network error") } })).rejects.toThrow("Network error")
  expect(notify).toHaveBeenCalledOnce()
})

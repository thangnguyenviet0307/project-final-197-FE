import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { toast, Toaster } from "@/components/ui/toast"
import { ThemeProvider } from "@/context/theme-provider"
import { queryClient } from "@/services/query-client"

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
})
afterEach(() => { toast.dismiss(); queryClient.clear(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it("shows compact, centered notifications without a close button in the bottom-left corner", async () => {
  render(<ThemeProvider defaultTheme="light" storageKey="toast-test-theme"><Toaster>
    <button onClick={() => toast.success("Saved successfully.")}>Save</button>
  </Toaster></ThemeProvider>)
  fireEvent.click(screen.getByRole("button", { name: "Save" }))
  expect(await screen.findByText("Saved successfully.")).toBeTruthy()
  const viewport = document.querySelector("[data-sonner-toaster]")
  expect(viewport?.getAttribute("data-x-position")).toBe("left")
  expect(viewport?.getAttribute("data-y-position")).toBe("bottom")
  expect(screen.queryByRole("button", { name: "Close toast" })).toBeNull()
  const notification = screen.getByText("Saved successfully.").closest<HTMLElement>("[data-sonner-toast]")!
  expect(notification.style.padding).toBe("8px 10px")
  expect(notification.style.display).toBe("grid")
  expect(notification.style.textAlign).toBe("center")
  expect((viewport as HTMLElement).style.getPropertyValue("--width")).toContain("280px")
})

it("shows action success messages and API failures through the shared query client", async () => {
  const success = vi.spyOn(toast, "success")
  const failure = vi.spyOn(toast, "error")
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => undefined, meta: { successMessage: "Account created successfully." },
  })
  await mutation.execute(undefined)
  expect(success).toHaveBeenCalledWith("Account created successfully.")
  const failed = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => { throw new Error("Action failed.") },
  })
  await expect(failed.execute(undefined)).rejects.toThrow("Action failed.")
  expect(failure).toHaveBeenCalledWith("Action failed.")
})

it("does not duplicate a form-level sign-in error as a toast", async () => {
  const failure = vi.spyOn(toast, "error")
  const mutation = queryClient.getMutationCache().build(queryClient, {
    mutationFn: async () => { throw new Error("The email or password is incorrect.") },
    meta: { suppressGlobalErrorToast: true },
  })
  await expect(mutation.execute(undefined)).rejects.toThrow("The email or password is incorrect.")
  expect(failure).not.toHaveBeenCalled()
})

it("automatically removes a toast after five seconds", async () => {
  vi.useFakeTimers()
  render(<ThemeProvider defaultTheme="light" storageKey="toast-test-theme"><Toaster /></ThemeProvider>)
  await act(async () => { toast.success("Timed notification"); await vi.advanceTimersByTimeAsync(100) })
  expect(screen.getByText("Timed notification")).toBeTruthy()
  await act(async () => { await vi.advanceTimersByTimeAsync(4900) })
  expect(screen.getByText("Timed notification")).toBeTruthy()
  await act(async () => { await vi.advanceTimersByTimeAsync(500) })
  expect(screen.queryByText("Timed notification")).toBeNull()
})

it("retains only the three newest notifications during a burst", async () => {
  vi.useFakeTimers()
  render(<ThemeProvider defaultTheme="light" storageKey="toast-test-theme"><Toaster /></ThemeProvider>)
  await act(async () => {
    for (let index = 1; index <= 8; index++) toast.success(`Burst ${index}`)
    await vi.advanceTimersByTimeAsync(600)
  })
  expect(screen.queryByText("Burst 1")).toBeNull()
  expect(screen.getByText("Burst 8")).toBeTruthy()
  expect(document.querySelectorAll("[data-sonner-toast]").length).toBeLessThanOrEqual(3)
})

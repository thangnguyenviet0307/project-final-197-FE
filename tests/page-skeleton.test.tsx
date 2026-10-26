import { expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { RootFallback } from "@/layout/root-layout"
import { ContentSkeleton } from "@/components/page-skeleton"

it("shows a skeleton during initial route loading and removes it when the page is ready", async () => {
  let finish: (() => void) | undefined
  const router = createMemoryRouter([{ path: "/", HydrateFallback: RootFallback, lazy: async () => {
    await new Promise<void>(resolve => { finish = resolve })
    return { Component: () => <p>Page ready</p> }
  } }])
  render(<RouterProvider router={router} />)
  const status = screen.getByRole("status", { name: "Đang tải trang" })
  expect(status.getAttribute("aria-busy")).toBe("true")
  expect(status.querySelector('[data-slot="skeleton"]')).toBeTruthy()
  await act(async () => { finish!() })
  expect(await screen.findByText("Page ready")).toBeTruthy()
  expect(screen.queryByRole("status", { name: "Đang tải trang" })).toBeNull()
})
it.each(["table", "form", "profile"] as const)("provides an accessible %s loading skeleton", variant => {
  render(<ContentSkeleton label="Loading data" variant={variant} />)
  expect(screen.getByRole("status", { name: "Loading data" }).querySelector('[data-slot="skeleton"]')).toBeTruthy()
})

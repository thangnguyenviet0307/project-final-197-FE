import { expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { RootFallback } from "@/layout/root-layout"
import { ContentSkeleton } from "@/components/page-skeleton"

it("shows a neutral progress bar during initial route loading and removes it when ready", async () => {
  let finish: (() => void) | undefined
  const router = createMemoryRouter([{ path: "/", HydrateFallback: RootFallback, lazy: async () => {
    await new Promise<void>(resolve => { finish = resolve })
    return { Component: () => <p>Page ready</p> }
  } }])
  render(<RouterProvider router={router} />)
  const progress = screen.getByRole("progressbar", { name: "Loading page" })
  expect(progress.querySelector('[data-slot="skeleton"]')).toBeNull()
  await act(async () => { finish!() })
  expect(await screen.findByText("Page ready")).toBeTruthy()
  expect(screen.queryByRole("progressbar", { name: "Loading page" })).toBeNull()
})
it.each(["table", "form", "profile"] as const)("provides an accessible %s loading skeleton", variant => {
  render(<ContentSkeleton label="Loading data" variant={variant} />)
  expect(screen.getByRole("status", { name: "Loading data" }).querySelector('[data-slot="skeleton"]')).toBeTruthy()
})

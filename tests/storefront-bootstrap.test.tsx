import { expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { RootFallback, RootLayout } from "@/layout/root-layout"
import { useAuthSession } from "@/features/auth/hooks/use-auth-session"

vi.mock("@/features/auth/hooks/use-auth-session", () => ({
  useAuthSession: vi.fn(() => ({ loading: true, error: null, retry: vi.fn(), clear: vi.fn() })),
}))

function setup(path: string) {
  vi.mocked(useAuthSession).mockClear()
  const router = createMemoryRouter([{
    element: <RootLayout />,
    children: [
      { path: "/", handle: { storefront: true }, element: <h1>Storefront home</h1> },
      { path: "/shop", handle: { storefront: true }, element: <h1>Storefront shop</h1> },
      { path: "/admin/dashboard", element: <h1>Admin dashboard</h1> },
    ],
  }], { initialEntries: [path] })
  return render(<RouterProvider router={router} />)
}

it.each(["/", "/shop"])("renders %s immediately without waiting for the admin session", path => {
  const { container } = setup(path)
  expect(screen.getByRole("heading", { name: /Storefront/ })).toBeTruthy()
  expect(useAuthSession).not.toHaveBeenCalled()
  expect(container.querySelector("aside")).toBeNull()
})

it("retains the admin skeleton while the admin session initializes", () => {
  const { container } = setup("/admin/dashboard")
  expect(useAuthSession).toHaveBeenCalled()
  expect(screen.queryByRole("heading", { name: "Admin dashboard" })).toBeNull()
  expect(container.querySelector("aside")).not.toBeNull()
})

it("does not show an admin layout while route modules load", () => {
  const { container } = render(<RootFallback />)
  expect(screen.getByRole("progressbar", { name: "Loading page" })).toBeTruthy()
  expect(container.querySelector("aside")).toBeNull()
})

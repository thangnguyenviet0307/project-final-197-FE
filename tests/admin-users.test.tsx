import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import UsersPage from "@/pages/admin-users"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/lib/query-client"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/components/layouts/base-layout", () => ({
  BaseLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}))
const originalAdapter = api.defaults.adapter
beforeEach(() => {
  clearAuth()
  useAuthStore.getState().setSession({ id: "self", name: "Admin", firstName: "Admin", lastName: "", email: "self@example.com", role: "admin", mustChangePassword: false }, { accessToken: "a", refreshToken: "r" })
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth() })
function setup(role: "admin" | "staff" = "staff") {
  const writes = vi.fn()
  api.defaults.adapter = async (config) => {
    if (config.method !== "get") writes(config.method, config.url, JSON.parse(config.data))
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: [{ _id: "target", firstName: "", lastName: "", email: "target@example.com", role, active: true }],
      pagination: { total: 1, totalPages: 1 },
    } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UsersPage /></MemoryRouter></QueryClientProvider>)
  return writes
}

it("keeps Full name empty when the account has no name instead of copying the account email", async () => {
  setup()
  const emailCell = await screen.findByText("target@example.com")
  const row = emailCell.closest("tr")!
  const nameCell = within(row).getAllByRole("cell")[0]
  expect(nameCell.firstElementChild?.lastElementChild?.textContent).toBe("")
  expect(within(row).getAllByText("target@example.com")).toHaveLength(1)
})

it.each([ ["staff", "Staff123"], ["admin", "Admin123"] ] as const)("creates %s accounts using the matching temporary password", async (role, password) => {
  const writes = setup()
  await screen.findByText("target@example.com")
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: role } })
  expect(screen.getByLabelText("Temporary password")).toHaveProperty("value", password)
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "New" } })
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "User" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } })
  fireEvent.click(screen.getByRole("button", { name: "Create account" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("post", "/users", expect.objectContaining({ role, password })))
})

it.each([ ["staff", "Staff123"], ["admin", "Admin123"] ] as const)("resets %s accounts using the matching temporary password", async (role, password) => {
  const writes = setup(role)
  fireEvent.click(await screen.findByRole("button", { name: "Reset password" }))
  const field = screen.getByLabelText("New temporary password")
  expect(field).toHaveProperty("value", password)
  fireEvent.submit(field.closest("form")!)
  await waitFor(() => expect(writes).toHaveBeenCalledWith("put", "/users/target", { password }))
})

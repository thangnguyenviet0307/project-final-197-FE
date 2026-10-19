import { beforeEach, afterEach, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders } from "axios"
import { SidebarProvider } from "@/components/ui/sidebar"
import { NavUser } from "@/layout/admin/nav-user"
import { SiteHeader } from "@/layout/admin/site-header"
import { queryClient } from "@/services/query-client"
import { useAuthStore } from "@/stores/auth.store"
import { api, clearAuth } from "@/services/api"

vi.mock("@/layout/admin/command-search", () => ({
  CommandSearch: () => null,
  SearchTrigger: () => <button>Search</button>,
}))
vi.mock("@/components/mode-toggle", () => ({ ModeToggle: () => <button>Theme</button> }))

const user = { id: "self", name: "Test User", firstName: "Test", lastName: "User", email: "test@example.com", role: "staff" as const, mustChangePassword: false }
const originalAdapter = api.defaults.adapter
beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })))
  useAuthStore.getState().setSession(user, { accessToken: "access", refreshToken: "refresh" })
})
afterEach(() => { clearAuth(); api.defaults.adapter = originalAdapter; vi.unstubAllGlobals() })

it("keeps profile/password/logout inside the account menu and uses avatar initials", async () => {
  render(<QueryClientProvider client={queryClient}><MemoryRouter><SidebarProvider>
    <NavUser user={{ ...user, avatar: "" }} />
  </SidebarProvider></MemoryRouter></QueryClientProvider>)
  expect(screen.getByText("TU")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Account menu Test User" }))
  expect((await screen.findByRole("menuitem", { name: "User Profile" })).getAttribute("href")).toBe("/settings/user")
  expect(screen.getByRole("menuitem", { name: "Change password" }).getAttribute("href")).toBe("/change-password")
  expect(screen.getByRole("menuitem", { name: "Sign out" })).toBeTruthy()
  expect(screen.queryByRole("menuitem", { name: /billing/i })).toBeNull()
})

it("account-menu logout calls the Backend, clears the session, and opens login", async () => {
  api.defaults.adapter = vi.fn(async (config) => ({ config, data: {}, status: 200, statusText: "", headers: new AxiosHeaders() }))
  render(<QueryClientProvider client={queryClient}><MemoryRouter><Routes>
    <Route path="/" element={<SidebarProvider><NavUser user={{ ...user, avatar: "" }} /></SidebarProvider>} />
    <Route path="/login" element={<p>Login page</p>} />
  </Routes></MemoryRouter></QueryClientProvider>)
  fireEvent.click(screen.getByRole("button", { name: "Account menu Test User" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Sign out" }))
  expect(await screen.findByText("Login page")).toBeTruthy()
  expect(useAuthStore.getState().isAuthenticated).toBe(false)
  expect(api.defaults.adapter).toHaveBeenCalledWith(expect.objectContaining({ method: "post", url: "/auth/logout" }))
})

it("does not show password or logout actions in the top header", () => {
  render(<MemoryRouter><SidebarProvider><SiteHeader /></SidebarProvider></MemoryRouter>)
  expect(screen.queryByText("Change password")).toBeNull()
  expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull()
  expect(screen.getByText("staff")).toBeTruthy()
})

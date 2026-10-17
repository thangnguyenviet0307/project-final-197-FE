import { beforeEach, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/router/protected-route"
import { useAuthStore } from "@/stores/auth.store"
import type { Role } from "@/types/auth"

function LoginLocation() {
  const location = useLocation()
  return <p>Login from {location.state?.from?.pathname}{location.state?.from?.search}</p>
}
function setup(path = "/users?tab=staff") {
  render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<PublicOnlyRoute />}><Route path="/login" element={<LoginLocation />} /></Route>
    <Route path="/403" element={<p>Forbidden</p>} />
    <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
      <Route path="/admin/dashboard" element={<p>Dashboard</p>} />
      <Route path="/change-password" element={<p>Change password</p>} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}><Route path="/users" element={<p>Users</p>} /></Route>
    </Route>
  </Routes></MemoryRouter>)
}
function session(role: Role, mustChangePassword = false) {
  useAuthStore.getState().setSession({ id: "a", name: "Test", firstName: "Test", lastName: "", email: "a@b.com", role, mustChangePassword }, { accessToken: "a", refreshToken: "r" })
}
beforeEach(() => { useAuthStore.getState().clearSession() })

it("redirects anonymous users and retains the requested location", async () => {
  setup()
  expect(await screen.findByText("Login from /users?tab=staff")).toBeTruthy()
})
it("denies staff access to user administration", async () => {
  session("staff"); setup()
  expect(await screen.findByText("Forbidden")).toBeTruthy()
})
it("allows admin access to user administration", async () => {
  session("admin"); setup()
  expect(await screen.findByText("Users")).toBeTruthy()
})
it("blocks dashboard access until the temporary password is changed", async () => {
  session("staff", true); setup("/admin/dashboard")
  expect(await screen.findByText("Change password")).toBeTruthy()
})
it("redirects authenticated users away from login", async () => {
  session("admin"); setup("/login")
  expect(await screen.findByText("Dashboard")).toBeTruthy()
})
it("denies customer access to the staff dashboard", async () => {
  session("customer"); setup("/admin/dashboard")
  expect(await screen.findByText("Forbidden")).toBeTruthy()
})
it("waits for session initialization before redirecting", () => {
  useAuthStore.setState({ isLoading: true }); setup()
  expect(screen.queryByText(/Login from/)).toBeNull()
  expect(screen.queryByText("Users")).toBeNull()
})

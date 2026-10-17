import type { ReactNode } from "react"
import { beforeEach, afterEach, expect, it, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders, AxiosError } from "axios"
import { MemoryRouter } from "react-router-dom"
import UserProfilePage from "@/pages/user-profile"
import { DeleteUserButton } from "@/components/auth/delete-user-button"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/lib/query-client"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/components/layouts/base-layout", () => ({
  BaseLayout: ({ children, title }: { children: ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>,
}))

const originalAdapter = api.defaults.adapter
const user = {
  id: "self", firstName: "Test", lastName: "User", name: "Test User", role: "staff" as const,
  email: "account@example.com", personalEmail: "personal@example.com", phone: "0123456", location: "HCM", bio: "Hello", mustChangePassword: false,
}
beforeEach(() => {
  clearAuth()
  useAuthStore.getState().setSession(user, { accessToken: "access", refreshToken: "refresh" })
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth(); vi.restoreAllMocks() })
function renderPage(node: ReactNode) {
  return render(<QueryClientProvider client={queryClient}><MemoryRouter>{node}</MemoryRouter></QueryClientProvider>)
}

it("loads the profile and keeps account email/role readonly while removing template fields", async () => {
  api.defaults.adapter = async (config) => ({ config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" })
  renderPage(<UserProfilePage />)
  expect(await screen.findByLabelText("First Name")).toHaveProperty("value", "Test")
  expect(screen.getByLabelText("Personal email")).toHaveProperty("value", "personal@example.com")
  expect(screen.getByLabelText("Account email")).toHaveProperty("readOnly", true)
  expect(screen.getByLabelText("Role")).toHaveProperty("readOnly", true)
  for (const label of ["Company", "Website", "Language", "Timezone"]) expect(screen.queryByLabelText(label)).toBeNull()
})

it("saves profile via API, updates the sidebar's user state, and invalidates the Users list", async () => {
  const invalidation = vi.spyOn(queryClient, "invalidateQueries")
  api.defaults.adapter = vi.fn(async (config) => {
    if (config.method === "patch") {
      expect(config.url).toBe("/auth/me")
      const body = config.data as FormData
      expect(body.get("firstName")).toBe("Updated")
      expect(body.get("personalEmail")).toBe("new@example.com")
      expect(body.has("email")).toBe(false)
      expect(body.has("role")).toBe(false)
      return { config, data: { data: { ...user, firstName: "Updated", personalEmail: "new@example.com" } }, headers: new AxiosHeaders(), status: 200, statusText: "" }
    }
    return { config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" }
  })
  renderPage(<UserProfilePage />)
  fireEvent.change(await screen.findByLabelText("First Name"), { target: { value: "Updated" } })
  fireEvent.change(screen.getByLabelText("Personal email"), { target: { value: "new@example.com" } })
  fireEvent.click(screen.getByRole("button", { name: "Save Changes" }))
  expect(await screen.findByText("Profile updated.")).toBeTruthy()
  expect(useAuthStore.getState().user).toMatchObject({ name: "Updated User", personalEmail: "new@example.com" })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["users"] })
})

it("avatar controls do not submit the profile and reject oversized uploads", async () => {
  api.defaults.adapter = vi.fn(async (config) => ({ config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" }))
  renderPage(<UserProfilePage />)
  await screen.findByLabelText("First Name")
  fireEvent.click(screen.getByRole("button", { name: "Reset photo" }))
  fireEvent.change(screen.getByLabelText("Profile photo"), { target: { files: [new File([new Uint8Array(800 * 1024 + 1)], "large.png", { type: "image/png" })] } })
  expect(await screen.findByText("Choose a JPG, PNG or GIF image up to 800 KB.")).toBeTruthy()
  expect(api.defaults.adapter).toHaveBeenCalledTimes(1)
})

it("requires an explicit popover confirmation before deleting an account", async () => {
  const deleted = vi.fn()
  api.defaults.adapter = vi.fn(async (config) => ({ config, data: {}, headers: new AxiosHeaders(), status: 200, statusText: "" }))
  renderPage(<DeleteUserButton id="target" email="target@example.com" onDeleted={deleted} />)
  fireEvent.click(screen.getByRole("button", { name: "Delete account target@example.com" }))
  await screen.findByText("Delete account?")
  expect(api.defaults.adapter).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
  expect(api.defaults.adapter).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "Delete account target@example.com" }))
  fireEvent.click(await screen.findByRole("button", { name: "Confirm deletion" }))
  await waitFor(() => expect(deleted).toHaveBeenCalledTimes(1))
  expect(api.defaults.adapter).toHaveBeenCalledWith(expect.objectContaining({ url: "/users/target", method: "delete" }))
})

it("keeps the warning open and shows Backend protection errors when deletion is denied", async () => {
  api.defaults.adapter = async (config) => { throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, {
    config, data: { message: "Cannot remove the last active administrator" }, status: 409, statusText: "", headers: new AxiosHeaders(),
  }) }
  renderPage(<DeleteUserButton id="target" email="target@example.com" onDeleted={vi.fn()} />)
  fireEvent.click(screen.getByRole("button", { name: "Delete account target@example.com" }))
  fireEvent.click(await screen.findByRole("button", { name: "Confirm deletion" }))
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Cannot remove the last active administrator")
})

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
  expect(await screen.findByText("Test User")).toBeTruthy()
  expect(screen.getByText("Thông tin cá nhân")).toBeTruthy()
  expect(screen.queryByText("Profile photo")).toBeNull()
  expect(screen.queryByText("Contact your administrator to change your account email.")).toBeNull()
  expect(screen.queryByLabelText("First Name")).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Cập nhật thông tin cá nhân" }))
  expect(await screen.findByLabelText("First Name")).toHaveProperty("value", "Test")
  expect(screen.getByLabelText("Personal email")).toHaveProperty("value", "personal@example.com")
  expect(screen.getByLabelText("Account email")).toHaveProperty("readOnly", true)
  expect(screen.getByLabelText("Role")).toHaveProperty("readOnly", true)
  expect(screen.getByText("Profile photo")).toBeTruthy()
  expect(screen.getByLabelText("Profile photo")).toBeTruthy()
  expect(screen.queryByText("Contact your administrator to change this address.")).toBeNull()
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
  fireEvent.click(await screen.findByRole("button", { name: "Cập nhật thông tin cá nhân" }))
  fireEvent.change(await screen.findByLabelText("First Name"), { target: { value: "Updated" } })
  fireEvent.change(screen.getByLabelText("Personal email"), { target: { value: "new@example.com" } })
  fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }))
  expect(await screen.findByText("Updated User")).toBeTruthy()
  expect(screen.queryByLabelText("First Name")).toBeNull()
  expect(useAuthStore.getState().user).toMatchObject({ name: "Updated User", personalEmail: "new@example.com" })
  expect(invalidation).toHaveBeenCalledWith({ queryKey: ["users"] })
})

it("opens the edit form on request and returns to the saved profile when canceled", async () => {
  api.defaults.adapter = async (config) => ({ config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" })
  renderPage(<UserProfilePage />)
  fireEvent.click(await screen.findByRole("button", { name: "Cập nhật thông tin cá nhân" }))
  fireEvent.change(await screen.findByLabelText("First Name"), { target: { value: "Preview" } })
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }))
  expect(await screen.findByText("Test User")).toBeTruthy()
  expect(screen.queryByLabelText("First Name")).toBeNull()
})

it("uploads a selected avatar with the profile and returns to the updated profile", async () => {
  let submittedAvatar: FormDataEntryValue | null = null
  api.defaults.adapter = vi.fn(async (config) => {
    if (config.method === "patch") {
      submittedAvatar = (config.data as FormData).get("avatar")
      return { config, data: { data: { ...user, avatar: "https://example.com/avatar.png" } }, headers: new AxiosHeaders(), status: 200, statusText: "" }
    }
    return { config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" }
  })
  renderPage(<UserProfilePage />)
  fireEvent.click(await screen.findByRole("button", { name: "Cập nhật thông tin cá nhân" }))
  const photo = new File([new Uint8Array([1, 2, 3])], "avatar.png", { type: "image/png" })
  fireEvent.change(screen.getByLabelText("Profile photo"), { target: { files: [photo] } })
  await waitFor(() => expect(screen.getByRole("button", { name: "Lưu thông tin" })).toHaveProperty("disabled", false))
  fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }))
  await waitFor(() => expect(submittedAvatar).toBeInstanceOf(File))
  expect(useAuthStore.getState().user?.avatar).toBe("https://example.com/avatar.png")
  expect(screen.queryByLabelText("Profile photo")).toBeNull()
})

it("resets the avatar to its default when saving profile changes", async () => {
  let submittedAvatar: FormDataEntryValue | null = null
  api.defaults.adapter = vi.fn(async (config) => {
    if (config.method === "patch") {
      submittedAvatar = (config.data as FormData).get("avatar")
      return { config, data: { data: { ...user, avatar: "" } }, headers: new AxiosHeaders(), status: 200, statusText: "" }
    }
    return { config, data: { data: user }, headers: new AxiosHeaders(), status: 200, statusText: "" }
  })
  renderPage(<UserProfilePage />)
  fireEvent.click(await screen.findByRole("button", { name: "Cập nhật thông tin cá nhân" }))
  fireEvent.click(screen.getByRole("button", { name: "Reset photo" }))
  fireEvent.click(screen.getByRole("button", { name: "Lưu thông tin" }))
  await waitFor(() => expect(submittedAvatar).toBe(""))
  expect(useAuthStore.getState().user?.avatar).toBe("")
  expect(screen.queryByLabelText("Profile photo")).toBeNull()
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

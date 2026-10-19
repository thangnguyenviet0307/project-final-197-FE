import UserCreatePage from "@/pages/admin/users/create"
import type { ReactNode } from "react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen, within, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import { AxiosHeaders, type AxiosResponse } from "axios"
import UsersPage from "@/pages/admin/users/index"
import { api, clearAuth } from "@/services/api"
import { queryClient } from "@/services/query-client"
import { useAuthStore } from "@/stores/auth.store"

vi.mock("@/layout/admin/base-layout", () => ({
  BaseLayout: ({ children, title }: { children: ReactNode; title?: string }) => <main>{title && <h1>{title}</h1>}{children}</main>,
}))
const originalAdapter = api.defaults.adapter
beforeEach(() => {
  queryClient.clear()
  clearAuth()
  useAuthStore.getState().setSession({ id: "self", name: "Admin", firstName: "Admin", lastName: "", email: "self@example.com", role: "admin", mustChangePassword: false }, { accessToken: "a", refreshToken: "r" })
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth() })
function UserTestRoutes() { return <Routes><Route path="/users/new" element={<UserCreatePage />} /><Route path="*" element={<UsersPage />} /></Routes> }
function setup(role: "admin" | "staff" = "staff") {
  const writes = vi.fn()
  api.defaults.adapter = async (config) => {
    if (config.method !== "get") writes(config.method, config.url, config.data ? JSON.parse(config.data) : undefined)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: [{ _id: "target", firstName: "", lastName: "", email: "target@example.com", role, active: true }],
      pagination: { total: 1, totalPages: 1 },
    } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  return writes
}

it("keeps Full name empty when the account has no name instead of copying the account email", async () => {
  setup()
  const emailCell = await screen.findByText("target@example.com")
  const row = emailCell.closest("tr")!
  const nameCell = within(row).getAllByRole("cell")[1]
  expect(nameCell.firstElementChild?.textContent).toBe("")
  expect(within(row).getAllByText("target@example.com")).toHaveLength(1)
})

it("constrains long full names to the name column and keeps the complete name available", async () => {
  api.defaults.adapter = async (config) => ({
    config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: [{ _id: "long-name", firstName: "A".repeat(80), lastName: "B".repeat(80), email: "long@example.com", role: "staff", active: true }],
      pagination: { total: 1, totalPages: 1 },
    },
  })
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  const row = (await screen.findByText("long@example.com")).closest("tr")!
  const nameCell = within(row).getAllByRole("cell")[1]
  const name = nameCell.querySelector("span.truncate")
  expect(screen.getByRole("table").querySelector("col")?.getAttribute("style")).toBe("width: 20%;")
  expect(screen.getByRole("table").classList.contains("w-full")).toBe(true)
  expect(screen.getByRole("table").classList.contains("min-w-[1250px]")).toBe(false)
  expect(name?.classList.contains("truncate")).toBe(true)
  expect(name?.getAttribute("title")).toBe(`${"A".repeat(80)} ${"B".repeat(80)}`)
})

it("keeps the Accounts table columns aligned across pages with different content", async () => {
  const requests: { page: number; limit: number }[] = []
  api.defaults.adapter = async (config) => {
    requests.push(config.params as { page: number; limit: number })
    const page = Number((config.params as { page: number }).page)
    const accounts = page === 1
      ? Array.from({ length: 10 }, (_, index) => ({
          _id: `page-1-${index}`,
          firstName: `Page One User ${index}`,
          lastName: "",
          email: `page1-${index}@example.com`,
          personalEmail: index === 0 ? "a-very-long-personal-email-address@example.com" : undefined,
          role: "staff" as const,
          active: true,
        }))
      : [{
          _id: "page-2",
          firstName: "A very long full name on page two",
          lastName: "",
          email: "page2@example.com",
          personalEmail: "personal@example.com",
          role: "admin" as const,
          active: true,
        }]
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: accounts,
      pagination: { total: 11, totalPages: 2 },
    } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)

  await screen.findByText("page1-0@example.com")
  const table = screen.getByRole("table")
  const widthsOnPageOne = Array.from(table.querySelectorAll("col"), (column) => column.getAttribute("style"))
  expect(table.classList.contains("table-fixed")).toBe(true)
  expect(widthsOnPageOne[0]).toBe("width: 20%;")
  expect(table.classList.contains("min-w-[1250px]")).toBe(false)
  expect(table.parentElement?.classList.contains("overflow-x-auto")).toBe(true)
  expect(table.parentElement?.parentElement?.classList.contains("overflow-x-auto")).toBe(false)

  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await screen.findByText("page2@example.com")
  expect(requests).toContainEqual(expect.objectContaining({ page: 1, limit: 10 }))
  expect(requests).toContainEqual(expect.objectContaining({ page: 2, limit: 10 }))
  const pageTwoTable = screen.getByRole("table")
  expect(Array.from(pageTwoTable.querySelectorAll("col"), (column) => column.getAttribute("style"))).toEqual(widthsOnPageOne)
  expect(pageTwoTable.classList.contains("table-fixed")).toBe(true)
  expect(pageTwoTable.classList.contains("min-w-[1250px]")).toBe(false)
})

it("searches accounts by name or account email and shows an empty search result", async () => {
  const requests: unknown[] = []
  api.defaults.adapter = vi.fn(async (config) => {
    if (config.method === "get") requests.push(config.params)
    const params = config.params as { search?: string }
    if (params.search === "Jane Smith") {
      return await new Promise<AxiosResponse>((resolve) => {
        releaseSearch = () => resolve({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
          data: [],
          pagination: { total: 0, totalPages: 1 },
        } })
      })
    }
    const result = params.search
      ? []
      : [{ _id: "target", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "staff", active: true }]
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: result,
      pagination: { total: result.length, totalPages: 1 },
    } }
  })
  let releaseSearch!: () => void
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)

  const search = await screen.findByRole("textbox", { name: "Search accounts by name or account email" })
  expect(await screen.findByText("jane@example.com")).toBeTruthy()
  expect(screen.getByRole("heading", { name: "Users" }).compareDocumentPosition(screen.getByRole("search")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.getByRole("navigation", { name: "Users pagination" })).toBeTruthy()
  const requestCount = requests.length
  fireEvent.change(search, { target: { value: "Jane Smith" } })
  expect(requests).toHaveLength(requestCount)
  await waitFor(() => expect(requests).toContainEqual(expect.objectContaining({
    page: 1, limit: 10, search: "Jane Smith",
  })))
  expect(screen.getByText("jane@example.com")).toBeTruthy()
  expect(screen.getByText("Searching")).toBeTruthy()
  releaseSearch()
  expect(await screen.findByText('No accounts found for "Jane Smith".')).toBeTruthy()

  const secondRequestCount = requests.length
  fireEvent.change(search, { target: { value: "jane@example.com" } })
  expect(requests).toHaveLength(secondRequestCount)
  await waitFor(() => expect(requests).toContainEqual(expect.objectContaining({
    page: 1, limit: 10, search: "jane@example.com",
  })))
  expect(await screen.findByText('No accounts found for "jane@example.com".')).toBeTruthy()
})

it.each(["staff", "admin"] as const)("creates %s accounts using the requested default password", async role => {
  const writes = setup()
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("link", { name: "Add User" }))
  fireEvent.click(await screen.findByRole("combobox", { name: "Role" }))
  const option = await screen.findByRole("option", { name: role === "admin" ? "Admin" : "Staff" })
  fireEvent.mouseMove(option)
  fireEvent.mouseDown(option)
  fireEvent.mouseUp(option)
  fireEvent.click(option)
  const password = (screen.getByLabelText("Temporary password") as HTMLInputElement).value
  expect(password).toBe(role === "admin" ? "Admin123" : "Staff123")
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: "New" } })
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "User" } })
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@example.com" } })
  fireEvent.click(screen.getByRole("button", { name: "Create account" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("post", "/users", expect.objectContaining({ role, password })))
})

it.each(["staff", "admin"] as const)("resets %s accounts using a stable random temporary password", async role => {
  const writes = setup(role)
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Edit account target@example.com" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Reset password" }))
  const field = screen.getByLabelText("New temporary password")
  const password = (field as HTMLInputElement).value
  expect(password.length).toBeGreaterThanOrEqual(20)
  expect(["Admin123", "Staff123"]).not.toContain(password)
  fireEvent.submit(field.closest("form")!)
  await waitFor(() => expect(writes).toHaveBeenCalledWith("put", "/users/target", { password }))
})

it("confirms account deletion from the Edit actions menu", async () => {
  const writes = setup()
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Edit account target@example.com" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Delete account" }))
  expect(await screen.findByText(/You are about to delete the account/)).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Confirm deletion" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("delete", "/users/target", undefined))
})




it("edits account access without silently resetting its password", async () => {
  const writes = setup()
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Edit account target@example.com" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Edit" }))
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "suspended" } })
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
  await waitFor(() => expect(writes).toHaveBeenCalledWith("put", "/users/target", { role: "staff", active: false }))
})


it("keeps account actions while using the shared catalog controls", async () => {
  setup()
  await screen.findByText("target@example.com")
  expect(screen.queryByRole("button", { name: "Invite User" })).toBeNull()
  expect(screen.queryByRole("button", { name: "View" })).toBeNull()
  expect(screen.queryByRole("checkbox")).toBeNull()
  expect(screen.queryByRole("combobox", { name: "Users per page" })).toBeNull()
  expect(screen.getByRole("navigation", { name: "Users pagination" })).toBeTruthy()
  expect(screen.getByRole("region", { name: "User management" }).classList.contains("dark")).toBe(false)
})

it("sorts by username only and provides a pointer cursor on its control", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
    data: [
      { _id: "zeta", firstName: "Alpha", lastName: "Name", email: "zeta@example.com", role: "staff", active: true },
      { _id: "alpha", firstName: "Zeta", lastName: "Name", email: "alpha@example.com", role: "admin", active: true },
    ].sort((a, b) => config.params.sortOrder === "desc" ? b.email.localeCompare(a.email) : a.email.localeCompare(b.email)), pagination: { total: 2, totalPages: 1 },
  } })
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  await screen.findByText("alpha@example.com")
  const usernames = () => within(screen.getByRole("table")).getAllByRole("row").slice(1)
    .map(row => within(row).getAllByRole("cell")[0].querySelector("span.truncate")?.textContent)
  expect(usernames()).toEqual(["alpha", "zeta"])
  const sort = screen.getByRole("button", { name: "Sort by username" })
  expect(sort.classList.contains("cursor-pointer")).toBe(true)
  expect(within(screen.getByRole("columnheader", { name: "Name" })).queryByRole("button")).toBeNull()
  expect(within(screen.getByRole("columnheader", { name: "Email" })).queryByRole("button")).toBeNull()
  fireEvent.click(sort)
  await waitFor(() => expect(usernames()).toEqual(["zeta", "alpha"]))
  expect(sort.closest("th")?.getAttribute("aria-sort")).toBe("descending")
})

it("uses only active/suspended statuses and admin/staff roles, including temporary accounts", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
    data: [{ _id: "temporary", firstName: "Temporary", lastName: "User", email: "temporary@example.com", role: "staff", active: true, mustChangePassword: true }],
    pagination: { total: 1, totalPages: 1 },
  } })
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  const row = (await screen.findByText("temporary@example.com")).closest("tr")!
  expect(within(row).getByText("Active")).toBeTruthy()
  expect(screen.queryByText("Invited")).toBeNull()
  const status = screen.getByRole("combobox", { name: "Account status" })
  expect(within(status).getByRole("option", { name: "Suspended" })).toBeTruthy()
  expect(within(status).queryByRole("option", { name: "Invited" })).toBeNull()
  fireEvent.change(status, { target: { value: "all" } })
  fireEvent.click(screen.getByRole("link", { name: "Add User" }))
  const role = await screen.findByRole("combobox", { name: "Role" })
  fireEvent.click(role)
  expect((await screen.findAllByRole("option")).map(option => option.textContent)).toEqual(["Staff", "Admin"])
  expect(screen.queryByText("Manager")).toBeNull()
  expect(screen.queryByText("Cashier")).toBeNull()
})

it("opens the selected user's profile and closes it without writing account data", async () => {
  const writes = setup()
  const row = (await screen.findByText("target@example.com")).closest("tr")!
  fireEvent.click(within(row).getAllByRole("cell")[1])
  const dialog = await screen.findByRole("dialog", { name: "User profile" })
  expect(within(dialog).getByText("Username")).toBeTruthy()
  expect(within(dialog).getAllByText("target@example.com")).toHaveLength(2)
  expect(within(dialog).getByText("Staff")).toBeTruthy()
  expect(within(dialog).getByText("Active")).toBeTruthy()
  expect(within(dialog).queryByText(/password/i)).toBeNull()
  fireEvent.click(within(dialog).getByRole("button", { name: "Close" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(writes).not.toHaveBeenCalled()
})

it.each(["Enter", " "])("opens a focused user row with the %s key", async key => {
  setup()
  const row = (await screen.findByText("target@example.com")).closest("tr")!
  row.focus()
  fireEvent.keyDown(row, { key })
  expect(await screen.findByRole("dialog", { name: "User profile" })).toBeTruthy()
})

it("keeps the account action menu separate from the profile dialog", async () => {
  setup()
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Edit account target@example.com" }))
  expect(await screen.findByRole("menuitem", { name: "Edit" })).toBeTruthy()
  expect(screen.queryByRole("dialog", { name: "User profile" })).toBeNull()
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }))
  expect(await screen.findByRole("dialog", { name: "Edit account" })).toBeTruthy()
  expect(screen.queryByRole("dialog", { name: "User profile" })).toBeNull()
})

it("shows the clicked account rather than the signed-in admin or a previous selection", async () => {
  api.defaults.adapter = async config => ({ config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
    data: [
      { _id: "one", firstName: "First", lastName: "User", email: "one@example.com", role: "staff", active: true },
      { _id: "two", firstName: "Second", lastName: "User", email: "two@example.com", personalEmail: "personal@example.com", phone: "0901234567", location: "Ho Chi Minh City", bio: "Second user's biography", role: "admin", active: false },
    ], pagination: { total: 2, totalPages: 1 },
  } })
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  fireEvent.click((await screen.findByText("one@example.com")).closest("tr")!)
  fireEvent.click(within(await screen.findByRole("dialog", { name: "User profile" })).getByRole("button", { name: "Close" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  fireEvent.click(screen.getByText("two@example.com").closest("tr")!)
  const dialog = await screen.findByRole("dialog", { name: "User profile" })
  for (const text of ["personal@example.com", "0901234567", "Ho Chi Minh City", "Second user's biography", "Admin", "Suspended"]) {
    expect(within(dialog).getByText(text)).toBeTruthy()
  }
  expect(within(dialog).queryByText("one@example.com")).toBeNull()
  expect(within(dialog).queryByText("self@example.com")).toBeNull()
})

it("keeps fixed page size and resets search and filters", async () => {
  const requests: unknown[] = []
  api.defaults.adapter = async config => {
    requests.push(config.params)
    return { config, headers: new AxiosHeaders(), status: 200, statusText: "OK", data: {
      data: config.params.active === false ? [] : [{ _id: "target", firstName: "Jane", lastName: "Smith", email: "jane@example.com", role: "staff", active: true }],
      pagination: { total: config.params.active === false ? 0 : 30, totalPages: Math.ceil(30 / Number(config.params.limit)) },
    } }
  }
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UserTestRoutes /></MemoryRouter></QueryClientProvider>)
  await screen.findByText("jane@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await waitFor(() => expect(requests).toContainEqual({ page: 2, limit: 10, sortBy: "username", sortOrder: "asc" }))
  await waitFor(() => expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(false))
  expect(screen.queryByLabelText("Users per page")).toBeNull()
  fireEvent.change(screen.getByLabelText("Search accounts by name or account email"), { target: { value: "Jane" } })
  await waitFor(() => expect(requests).toContainEqual({ page: 1, limit: 10, search: "Jane", sortBy: "username", sortOrder: "asc" }))
  fireEvent.change(screen.getByLabelText("Account status"), { target: { value: "suspended" } })
  expect(await screen.findByText("No users match your filters.")).toBeTruthy()
  expect(requests).toContainEqual({ page: 1, limit: 10, search: "Jane", active: false, sortBy: "username", sortOrder: "asc" })
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }))
  expect(await screen.findByText("jane@example.com")).toBeTruthy()
  expect((screen.getByLabelText("Search accounts by name or account email") as HTMLInputElement).value).toBe("")
  expect((screen.getByLabelText("Account status") as HTMLSelectElement).value).toBe("all")
  expect(screen.getByText("Page 1 of 3")).toBeTruthy()
})

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
  queryClient.clear()
  clearAuth()
  useAuthStore.getState().setSession({ id: "self", name: "Admin", firstName: "Admin", lastName: "", email: "self@example.com", role: "admin", mustChangePassword: false }, { accessToken: "a", refreshToken: "r" })
})
afterEach(() => { api.defaults.adapter = originalAdapter; clearAuth() })
function setup(role: "admin" | "staff" = "staff") {
  const writes = vi.fn()
  api.defaults.adapter = async (config) => {
    if (config.method !== "get") writes(config.method, config.url, config.data ? JSON.parse(config.data) : undefined)
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

it("constrains long full names to the name column and keeps the complete name available", async () => {
  api.defaults.adapter = async (config) => ({
    config, headers: new AxiosHeaders(), status: 200, statusText: "", data: {
      data: [{ _id: "long-name", firstName: "A".repeat(80), lastName: "B".repeat(80), email: "long@example.com", role: "staff", active: true }],
      pagination: { total: 1, totalPages: 1 },
    },
  })
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UsersPage /></MemoryRouter></QueryClientProvider>)
  const row = (await screen.findByText("long@example.com")).closest("tr")!
  const nameCell = within(row).getAllByRole("cell")[0]
  const name = nameCell.querySelector("span.truncate")
  expect(screen.getByRole("table").querySelector("col")?.getAttribute("style")).toBe("width: 24%;")
  expect(screen.getByRole("table").classList.contains("w-full")).toBe(true)
  expect(screen.getByRole("table").classList.contains("min-w-[1250px]")).toBe(false)
  expect(name?.classList.contains("truncate")).toBe(true)
  expect(name?.getAttribute("title")).toBe(`${"A".repeat(80)} ${"B".repeat(80)}`)
})

it("keeps the Accounts table columns aligned across pages with different content", async () => {
  api.defaults.adapter = async (config) => {
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
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UsersPage /></MemoryRouter></QueryClientProvider>)

  await screen.findByText("page1-0@example.com")
  const table = screen.getByRole("table")
  const widthsOnPageOne = Array.from(table.querySelectorAll("col"), (column) => column.getAttribute("style"))
  expect(table.classList.contains("table-fixed")).toBe(true)
  expect(widthsOnPageOne[0]).toBe("width: 24%;")
  expect(table.classList.contains("min-w-[1250px]")).toBe(false)
  expect(table.parentElement?.classList.contains("overflow-x-auto")).toBe(true)
  expect(table.parentElement?.parentElement?.classList.contains("overflow-x-auto")).toBe(false)

  fireEvent.click(screen.getByRole("button", { name: "Next" }))
  await screen.findByText("page2@example.com")
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
      return await new Promise((resolve) => {
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
  render(<QueryClientProvider client={queryClient}><MemoryRouter><UsersPage /></MemoryRouter></QueryClientProvider>)

  const search = await screen.findByRole("textbox", { name: "Search accounts by name or account email" })
  expect(await screen.findByText("jane@example.com")).toBeTruthy()
  expect(screen.getByText("Accounts").compareDocumentPosition(screen.getByRole("search")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  expect(screen.getByRole("table").parentElement?.parentElement?.parentElement?.classList.contains("min-h-[610px]")).toBe(true)
  expect(screen.getByRole("table").classList.contains("[&_td]:py-3")).toBe(true)
  expect(screen.getByText(/Page 1/).parentElement?.classList.contains("mt-3")).toBe(true)
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
  await screen.findByText("target@example.com")
  fireEvent.click(screen.getByRole("button", { name: "Edit account target@example.com" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Reset password" }))
  const field = screen.getByLabelText("New temporary password")
  expect(field).toHaveProperty("value", password)
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

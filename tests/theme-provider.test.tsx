import { useContext } from "react"
import { afterEach, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ThemeProvider } from "@/context/theme-provider"
import { ThemeProviderContext } from "@/context/theme-context"

function Controls() {
  const { theme, setTheme } = useContext(ThemeProviderContext)
  return <><span>{theme}</span><button onClick={() => setTheme("dark")}>Dark</button></>
}
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); document.documentElement.classList.remove("light", "dark") })

it("renders with fallback when storage reads and writes throw and still changes theme", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Blocked", "SecurityError") })
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError") })
  render(<ThemeProvider defaultTheme="light"><Controls /></ThemeProvider>)
  expect(document.documentElement.classList.contains("light")).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Dark" }))
  expect(screen.getByText("dark")).toBeTruthy()
  expect(document.documentElement.classList.contains("dark")).toBe(true)
})

it.each(["dark light", "unexpected", ""])("ignores invalid stored theme %j", value => {
  localStorage.setItem("vite-ui-theme", value)
  render(<ThemeProvider defaultTheme="light"><Controls /></ThemeProvider>)
  expect(document.documentElement.classList.contains("light")).toBe(true)
})

it("restores a valid persisted theme", () => {
  localStorage.setItem("vite-ui-theme", "dark")
  render(<ThemeProvider defaultTheme="light"><Controls /></ThemeProvider>)
  expect(document.documentElement.classList.contains("dark")).toBe(true)
})

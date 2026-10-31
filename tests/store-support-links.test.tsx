import { render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { MemoryRouter, matchRoutes } from "react-router-dom"
import { StoreFooter } from "@/layout/storefront/store-footer"
import { routes } from "@/router/routes"

it("footer links resolve to real storefront routes and newsletter is explicitly unavailable", () => {
  render(<MemoryRouter><StoreFooter /></MemoryRouter>)
  for (const link of screen.getAllByRole("link")) {
    const href = link.getAttribute("href")!
    const matches = matchRoutes(routes, href)
    expect(matches?.length).toBeTruthy()
    expect(matches?.at(-1)?.route.path).not.toBe("*")
  }
  expect(screen.getByText(/tính năng nhận tin chưa khả dụng/)).toBeTruthy()
  expect((screen.getByRole("button", { name: "Đăng ký nhận tin" }) as HTMLButtonElement).disabled).toBe(true)
})

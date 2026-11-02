import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect, useState } from "react"
import { MemoryRouter, Route, Routes, Link } from "react-router-dom"
import { afterEach, expect, it, vi } from "vitest"
import { StorefrontHashScroll } from "@/layout/storefront/store-layout"

function HomeWithPendingContent() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 50)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <>
      {loading && <p role="status">Đang tải sản phẩm...</p>}
      <section id="tin-tuc">Tin tức và mẹo sử dụng phụ kiện</section>
    </>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

it("navigates to the homepage and scrolls to the news section from another page", async () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  render(
    <MemoryRouter initialEntries={["/about"]}>
      <main id="main-content">
        <StorefrontHashScroll />
        <Routes>
          <Route
            path="/about"
            element={<Link to="/#tin-tuc">TIN TỨC</Link>}
          />
          <Route
            path="/"
            element={<section id="tin-tuc">Tin tức và mẹo sử dụng phụ kiện</section>}
          />
        </Routes>
      </main>
    </MemoryRouter>
  )

  fireEvent.click(screen.getByRole("link", { name: "TIN TỨC" }))

  expect(
    await screen.findByText("Tin tức và mẹo sử dụng phụ kiện")
  ).toBeTruthy()
  await waitFor(() => expect(scrollIntoView).toHaveBeenCalledWith({
    behavior: "smooth",
    block: "start",
  }))
})

it("scrolls to the news section when loading a homepage URL with a hash", async () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  render(
    <MemoryRouter initialEntries={["/#tin-tuc"]}>
      <main id="main-content">
        <StorefrontHashScroll />
        <Routes>
          <Route
            path="/"
            element={<section id="tin-tuc">Tin tức và mẹo sử dụng phụ kiện</section>}
          />
        </Routes>
      </main>
    </MemoryRouter>
  )

  expect(
    await screen.findByText("Tin tức và mẹo sử dụng phụ kiện")
  ).toBeTruthy()
  await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
})

it("repositions the news section after pending homepage content changes layout", async () => {
  const scrollIntoView = vi.fn()
  Element.prototype.scrollIntoView = scrollIntoView

  render(
    <MemoryRouter initialEntries={["/about"]}>
      <main id="main-content">
        <StorefrontHashScroll />
        <Routes>
          <Route
            path="/about"
            element={<Link to="/#tin-tuc">TIN TỨC</Link>}
          />
          <Route path="/" element={<HomeWithPendingContent />} />
        </Routes>
      </main>
    </MemoryRouter>
  )

  fireEvent.click(screen.getByRole("link", { name: "TIN TỨC" }))
  await waitFor(() => expect(scrollIntoView.mock.calls.length).toBeGreaterThanOrEqual(2))
})

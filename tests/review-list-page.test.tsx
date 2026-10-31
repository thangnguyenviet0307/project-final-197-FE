import { act, render, screen, waitFor } from "@testing-library/react"
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom"
import { expect, it } from "vitest"
import { useValidListPage } from "@/hooks/use-valid-list-page"

it("recovers only settled current responses, preserving filters and replacing history", async () => {
  const state = { isSuccess: true, isFetching: false, isPlaceholderData: true, data: { pagination: { totalPages: 1 } } }
  function Page() {
    const location = useLocation()
    useValidListPage(Number(new URLSearchParams(location.search).get("page")), state)
    return <output>{location.search}</output>
  }
  const router = createMemoryRouter([{ path: "*", element: <Page /> }], { initialEntries: ["/previous", "/list?page=3&search=cable&limit=10"], initialIndex: 1 })
  const view = render(<RouterProvider router={router} />)
  expect(screen.getByRole("status").textContent).toContain("page=3")
  state.isPlaceholderData = false
  state.isFetching = true
  view.rerender(<RouterProvider router={router} />)
  await act(async () => { await router.navigate(router.state.location) })
  expect(router.state.location.search).toContain("page=3")
  state.isFetching = false
  await act(async () => { await router.navigate(router.state.location, { replace: true }) })
  await waitFor(() => expect(router.state.location.search).toBe("?page=1&search=cable&limit=10"))
  expect(router.state.historyAction).toBe("REPLACE")
})

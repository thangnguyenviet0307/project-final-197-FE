vi.mock("@/features/support/hooks/use-information", () => ({ useInformation: () => ({ data: null, isPending: false, isError: false }) }))
import { expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import InformationPlaceholderPage from "@/pages/storefront/support/information-placeholder"
import { pendingInformationPages } from "@/features/support/utils/policy-documents"

it.each(pendingInformationPages)("opens the $title unpublished page with shared navigation", ({ slug, title }) => {
  render(<MemoryRouter initialEntries={[`/${slug}`]}><InformationPlaceholderPage /></MemoryRouter>)
  expect(screen.getByRole("heading", { name: title })).toBeTruthy()
  expect(screen.getByText("Nội dung đang được cập nhật.")).toBeTruthy()
  expect(screen.getByRole("link", { name: title }).getAttribute("aria-current")).toBe("page")
  expect(screen.getByRole("navigation", { name: "Về chúng tôi" })).toBeTruthy()
  expect(screen.getByRole("navigation", { name: "Hỗ trợ khách hàng" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Liên hệ cửa hàng" }).getAttribute("href")).toBe("/contact")
})

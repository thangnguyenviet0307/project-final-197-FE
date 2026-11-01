import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { expect, it } from "vitest"

import StorefrontAboutPage from "@/pages/storefront/about"
import StorefrontFAQPage from "@/pages/storefront/faq"

it("introduces DemoStore and explains the current storefront scope", () => {
  render(
    <MemoryRouter>
      <StorefrontAboutPage />
    </MemoryRouter>
  )

  expect(
    screen.getByRole("heading", { name: /Khám phá công nghệ/ })
  ).toBeTruthy()
  expect(
    screen.getByText(/đặt hàng, thanh toán và gửi lời nhắn/i)
  ).toBeTruthy()
  expect(
    screen.getByRole("link", { name: /Khám phá sản phẩm/ }).getAttribute("href")
  ).toBe("/shop")
})

it("filters FAQ questions by answer content and topic", () => {
  render(
    <MemoryRouter>
      <StorefrontFAQPage />
    </MemoryRouter>
  )

  fireEvent.change(screen.getByRole("searchbox", { name: "Tìm câu hỏi" }), {
    target: { value: "nhập lời nhắn" },
  })
  expect(
    screen.getByText("Tôi có thể gửi câu hỏi qua trang Liên hệ không?")
  ).toBeTruthy()

  fireEvent.change(screen.getByRole("searchbox", { name: "Tìm câu hỏi" }), {
    target: { value: "" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Sản phẩm" }))

  expect(screen.getByRole("heading", { name: "Tìm kiếm và xem sản phẩm" })).toBeTruthy()
  expect(
    screen.queryByRole("heading", { name: "Đặt hàng và thanh toán" })
  ).toBeNull()
})

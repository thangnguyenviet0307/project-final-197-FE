import { expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { ProductImage } from "@/features/products/components/product-image"

it("shows a fallback for missing and broken images and recovers when the URL changes", () => {
  const { rerender } = render(<ProductImage alt="Case" />)
  expect(screen.getByRole("img", { name: "Case: image unavailable" })).toBeTruthy()
  rerender(<ProductImage src="/broken.png" alt="Case" />)
  fireEvent.error(screen.getByRole("img", { name: "Case" }))
  expect(screen.getByRole("img", { name: "Case: image unavailable" })).toBeTruthy()
  rerender(<ProductImage src="/working.png" alt="Case" />)
  expect(screen.getByRole("img", { name: "Case" }).getAttribute("src")).toBe("/working.png")
})

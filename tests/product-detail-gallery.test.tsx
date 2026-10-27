import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it } from "vitest"
import { ProductDetailGallery } from "@/features/products/components/product-detail-gallery"
import type { Product } from "@/features/products/types/products"

const product: Product = {
  _id: "a".repeat(24), product_name: "Điện thoại", category: null, brand: null,
  thumbnail: "/main.jpg", sourceImages: ["/main.jpg", "/source.jpg"],
  variants: [{ sku: "BLUE", price: 100, image: "/blue.jpg" }],
}

it("deduplicates images and lets the reader select variant images", () => {
  render(<ProductDetailGallery product={product} />)
  expect(screen.getAllByRole("button")).toHaveLength(3)
  fireEvent.click(screen.getByRole("button", { name: "Xem ảnh 3" }))
  expect(screen.getByRole("img", { name: "Điện thoại" }).getAttribute("src")).toBe("/blue.jpg")
  expect(screen.getByRole("button", { name: "Xem ảnh 3" }).getAttribute("aria-pressed")).toBe("true")
})

it("falls back when a selected image disappears after a refetch", () => {
  const view = render(<ProductDetailGallery product={product} />)
  fireEvent.click(screen.getByRole("button", { name: "Xem ảnh 3" }))
  view.rerender(<ProductDetailGallery product={{ ...product, variants: [] }} />)
  expect(screen.getByRole("img", { name: "Điện thoại" }).getAttribute("src")).toBe("/main.jpg")
})

import { afterEach, beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { HomeHeroSlider } from "@/features/storefront/components/home-hero-slider"
import type { PublicHeroSlide } from "@/features/hero-slides/types/hero-slides"
const state = vi.hoisted(() => ({ data: [] as PublicHeroSlide[], isPending: false, isError: false, refetch: vi.fn() }))
vi.mock("@/features/hero-slides/hooks/use-hero-slides", () => ({ usePublicHeroSlides: () => state }))
beforeEach(() => {
  state.data = [
    { _id: "one", category: { _id: "a".repeat(24), name: "Tai nghe", icon: "https://images.test/category.jpg" }, title: "Tiêu đề riêng", description: "Mô tả riêng", imageUrl: "https://images.test/hero.jpg", sortOrder: 1 },
    { _id: "two", category: { _id: "b".repeat(24), name: "Cáp sạc" }, title: "Tiêu đề thứ hai", description: "", imageUrl: null, sortOrder: 2 },
  ]
  state.isPending = false; state.isError = false; state.refetch.mockClear()
})
afterEach(() => vi.useRealTimers())
it("renders API title/description/image and generates a category-specific CTA, keeping only left selectors", () => {
  render(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(screen.getByRole("heading", { name: "Tiêu đề riêng" })).toBeTruthy()
  expect(screen.getByText("Mô tả riêng")).toBeTruthy()
  expect(screen.getByRole("link", { name: "Khám phá Tai nghe" }).getAttribute("href")).toBe(`/shop?category=${"a".repeat(24)}`)
  expect(document.querySelector("img")?.getAttribute("src")).toBe("https://images.test/hero.jpg")
  expect(screen.queryByRole("button", { name: "Banner trước" })).toBeNull()
  expect(screen.queryByRole("button", { name: "Banner tiếp theo" })).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "Chuyển đến banner 2" }))
  expect(screen.getByRole("heading", { name: "Tiêu đề thứ hai" })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Khám phá Cáp sạc" })).toBeTruthy()
})
it("autoplays API slides and safely recovers if the current slide is removed", () => {
  vi.useFakeTimers()
  const view = render(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  act(() => vi.advanceTimersByTime(6500))
  expect(screen.getByRole("button", { name: "Chuyển đến banner 2" }).getAttribute("aria-pressed")).toBe("true")
  state.data = [state.data[0]]
  view.rerender(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(screen.getByRole("heading", { name: "Tiêu đề riêng" })).toBeTruthy()
  expect(screen.queryByRole("button")).toBeNull()
})
it("uses category images and preserves a welcome hero until configured slides are available", () => {
  state.data = [{ ...state.data[0], imageUrl: null }]
  const view = render(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(document.querySelector("img")?.getAttribute("src")).toBe("https://images.test/category.jpg")
  state.data = []
  view.rerender(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(screen.getByRole("region", { name: "Khám phá cửa hàng" })).toBeTruthy()
  expect(screen.getByRole("heading", { level: 1 })).toBeTruthy()
  expect(screen.getByRole("link", { name: "Khám phá sản phẩm" }).getAttribute("href")).toBe("/shop")
  expect(screen.queryByRole("button", { name: /Chuyển đến banner/ })).toBeNull()
  expect(document.querySelector("img")).toBeNull()
  state.data = [{ _id: "new", category: { _id: "a".repeat(24), name: "Danh mục mới" }, title: "Banner vừa thêm", description: "", imageUrl: null, sortOrder: 0 }]
  view.rerender(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(screen.getByRole("heading", { name: "Banner vừa thêm" })).toBeTruthy()
  expect(screen.queryByRole("region", { name: "Khám phá cửa hàng" })).toBeNull()
})
it("shows loading and retry states without using hardcoded category banners", () => {
  state.isPending = true; state.data = []
  const view = render(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  expect(screen.getByRole("status")).toBeTruthy()
  state.isPending = false; state.isError = true
  view.rerender(<MemoryRouter><HomeHeroSlider /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }))
  expect(state.refetch).toHaveBeenCalledOnce()
  expect(screen.queryByRole("heading")).toBeNull()
})

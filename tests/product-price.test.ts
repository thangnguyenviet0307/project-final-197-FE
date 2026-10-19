import { expect, it } from "vitest"
import { discountedPrice } from "@/lib/product-price"

it.each([
  [0.05, 30, 0.04], [0.1, 65, 0.04], [0.25, 34, 0.17],
  [100, 25, 75], [100, 0, 100], [0, 70, 0], [1.005, 0, 1.01],
  [1e-7, 0, 0], [100000, 10.5, 89500],
])("rounds price %s with discount %s half up to %s", (price, discount, expected) => {
  expect(discountedPrice(price, discount)).toBe(expected)
})
it("defaults a missing discount to zero and handles unrepresentable amounts safely", () => {
  expect(discountedPrice(150)).toBe(150)
  for (const [price, discount] of [[NaN, 0], [-1, 0], [100, 71], [Infinity, 0], [1e20, 0]]) expect(discountedPrice(price, discount)).toBeNull()
})

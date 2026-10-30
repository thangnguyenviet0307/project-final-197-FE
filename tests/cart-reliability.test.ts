import { beforeEach, expect, it } from "vitest"
import { appendCartOperation, readCartJournal } from "@/features/cart/utils/cart-journal"
import { buildCartItem } from "@/features/cart/utils/cart-item"
import { cartTotal } from "@/features/cart/utils/cart-total"
import { useCartStore } from "@/stores/cart.store"
import type { Product } from "@/features/products/types/products"

const product: Product = { _id: "product", slug: "product", product_name: "Product", price: 0.05, discount: 10, stock: 20, category: null, brand: null }
beforeEach(() => { useCartStore.setState({ items: [] }); localStorage.clear() })

it("merges additions made by two tabs from the same stale cart", () => {
  const base = buildCartItem(product, "", 2, true)!
  appendCartOperation(localStorage, [], [base], "initial")
  appendCartOperation(localStorage, [base], [{ ...base, quantity: 3 }], "tab-a")
  appendCartOperation(localStorage, [base], [{ ...base, quantity: 4 }], "tab-b")
  expect(readCartJournal(localStorage)?.[0].quantity).toBe(5)
});

it("preserves concurrent additions when checkout removes only purchased quantities", () => {
  const base = buildCartItem(product, "", 2, true)!
  appendCartOperation(localStorage, [], [base], "initial")
  appendCartOperation(localStorage, [base], [{ ...base, quantity: 3 }], "another-tab")
  appendCartOperation(localStorage, [base], [], "purchase-request")
  appendCartOperation(localStorage, [base], [], "purchase-request")
  expect(readCartJournal(localStorage)?.[0].quantity).toBe(1)
});

it("does not subtract a confirmed purchase twice after restoring the request", () => {
  useCartStore.getState().addItem(product, "", 3)
  useCartStore.getState().consumePurchasedItems([{ productId: product._id, quantity: 2 }], "purchase-id")
  useCartStore.getState().consumePurchasedItems([{ productId: product._id, quantity: 2 }], "purchase-id")
  expect(useCartStore.getState().items[0].quantity).toBe(1)
});

it("marks a removed variant unavailable after refresh and allows choosing a valid replacement", () => {
  const variants = [{ _id: "a", sku: "A", price: 100, stock: 10 }, { _id: "b", sku: "B", price: 200, stock: 10 }]
  useCartStore.getState().addItem({ ...product, variants }, "a", 2)
  useCartStore.getState().refreshProducts([{ ...product, variants: [variants[1]] }])
  expect(useCartStore.getState().items[0].unavailableReason).toBeTruthy()
  expect(useCartStore.getState().changeVariant(product._id, "a", "b")).toBeNull()
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "b", quantity: 2 })
  expect(useCartStore.getState().items[0].unavailableReason).toBeUndefined()
});

it("keeps deleted products visibly unavailable and uses the same rounded line totals everywhere", () => {
  useCartStore.getState().addItem(product, "", 3)
  expect(cartTotal(useCartStore.getState().items)).toBe(0.14)
  useCartStore.getState().refreshProducts([], [product.slug!])
  expect(useCartStore.getState().items[0].unavailableReason).toBeTruthy()
});

it("recomputes minimum quantity and stock after replaying deltas", () => {
  const item = buildCartItem({ ...product, minimumOrderQuantity: 3 }, "", 3, true)!
  appendCartOperation(localStorage, [], [item], "initial")
  expect(readCartJournal(localStorage)?.[0].unavailableReason).toBeUndefined()
  appendCartOperation(localStorage, [item], [{ ...item, quantity: 30 }], "larger")
  expect(readCartJournal(localStorage)?.[0].unavailableReason).toBeTruthy()
});

it("does not carry a negative balance after two stale tabs remove the same line", () => {
  const item = buildCartItem(product, "", 2, true)!
  appendCartOperation(localStorage, [], [item], "initial")
  appendCartOperation(localStorage, [item], [], "remove-a")
  appendCartOperation(localStorage, [item], [], "remove-b")
  appendCartOperation(localStorage, [], [{ ...item, quantity: 1 }], "new-addition")
  expect(readCartJournal(localStorage)?.[0].quantity).toBe(1)
});

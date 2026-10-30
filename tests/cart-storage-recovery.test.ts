import { expect, it, vi } from "vitest"
import { buildCartItem } from "@/features/cart/utils/cart-item"
import { CART_STORAGE_KEY, serializeCart } from "@/features/cart/utils/cart-storage"
import { readCartJournal } from "@/features/cart/utils/cart-journal"

it("retains a legacy cart when journal migration fails and retries it before later changes", async () => {
  localStorage.clear()
  const item = buildCartItem({ _id: "legacy", slug: "legacy", product_name: "Legacy", price: 100, stock: 10, category: null, brand: null }, "", 2, false)!
  localStorage.setItem(CART_STORAGE_KEY, serializeCart([item]))
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError") })
  try {
    const { useCartStore } = await import("@/stores/cart.store")
    expect(useCartStore.getState().items[0].quantity).toBe(2)
    write.mockRestore()
    useCartStore.getState().setQuantity("legacy", "", 3)
    expect(useCartStore.getState().items[0].quantity).toBe(3)
    expect(readCartJournal(localStorage)?.[0].quantity).toBe(3)
  } finally { write.mockRestore(); localStorage.clear() }
})

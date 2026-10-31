import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/features/auth/types/auth"
import { beforeEach, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { CART_STORAGE_KEY, cartStorageKey, serializeCart } from "@/features/cart/utils/cart-storage"
import { appendCartOperation, CART_OPERATION_PREFIX } from "@/features/cart/utils/cart-journal"
import { Link, MemoryRouter, Route, Routes } from "react-router-dom"
import { useCartStore } from "@/stores/cart.store"
import type { Product } from "@/features/products/types/products"
import CartPage from "@/pages/storefront/cart"

const product: Product = {
  _id: "product-1", slug: "san-pham", product_name: "Sản phẩm thử",
  category: null, brand: null, price: 100000, discount: 10, stock: 5,
  variants: [
    { _id: "blue", sku: "BLUE", variant_name: "Xanh", price: 200000, stock: 3 },
    { _id: "red", sku: "RED", variant_name: "Đỏ", price: 100000, stock: 2 },
  ],
}

beforeEach(() => {
  useAuthStore.getState().clearSession()
  window.localStorage.clear()
  window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: window.localStorage }))
  useCartStore.setState({ items: [] })
})

function signIn(id: string) {
  const user: User = { id, name: id, firstName: id, lastName: "Customer", email: `${id}@example.com`, accountType: "customer", mustChangePassword: false }
  useAuthStore.getState().setSession(user, { accessToken: "access" })
}

it("keeps independent carts for each customer and guest across login/logout and switching accounts", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  signIn("customer-a")
  expect(useCartStore.getState().items).toEqual([])
  useCartStore.getState().addItem(product, "red", 1)
  signIn("customer-b")
  expect(useCartStore.getState().items).toEqual([])
  useCartStore.getState().addItem(product, "blue", 2)
  signIn("customer-a")
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", quantity: 1, selected: false })
  useAuthStore.getState().clearSession()
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "blue", quantity: 1, selected: false })
  signIn("customer-b")
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "blue", quantity: 2, selected: false })
  expect(JSON.parse(localStorage.getItem(cartStorageKey("customer-a"))!).items[0].variantKey).toBe("red")
  expect(JSON.parse(localStorage.getItem(cartStorageKey("customer-b"))!).items[0].quantity).toBe(2)
  expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!).items[0].quantity).toBe(1)
})

it("restores an account's stored cart and keeps profile/token updates in the same cart", () => {
  useCartStore.getState().addItem(product, "red", 1)
  const stored = serializeCart(useCartStore.getState().items)
  localStorage.setItem(cartStorageKey("saved"), stored)
  signIn("saved")
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", selected: false })
  useCartStore.getState().setSelected(product._id, "red", true)
  const items = useCartStore.getState().items
  useAuthStore.getState().setTokens({ accessToken: "new-token" })
  useAuthStore.setState({ user: { ...useAuthStore.getState().user!, firstName: "Updated" } })
  expect(useCartStore.getState().items).toBe(items)
  localStorage.setItem(cartStorageKey("broken"), "invalid json")
  signIn("broken")
  expect(useCartStore.getState().items).toEqual([])
})

it("applies cross-tab changes only to the active customer's cart", () => {
  signIn("customer-a")
  useCartStore.getState().addItem(product, "blue", 1)
  const before = useCartStore.getState().items
  const changed = before.map(item => ({ ...item, quantity: 2 }))
  for (const scope of [cartStorageKey("customer-b"), CART_STORAGE_KEY]) {
    const key = `${scope}:operation:other-tab`
    appendCartOperation(localStorage, before, changed, "other-tab", `${scope}:operation:`)
    window.dispatchEvent(new StorageEvent("storage", { key, storageArea: localStorage }))
  }
  expect(useCartStore.getState().items[0].quantity).toBe(1)
  const key = `${cartStorageKey("customer-a")}:operation:other-tab`
  appendCartOperation(localStorage, before, changed, "other-tab", `${cartStorageKey("customer-a")}:operation:`)
  window.dispatchEvent(new StorageEvent("storage", { key, storageArea: localStorage }))
  expect(useCartStore.getState().items[0].quantity).toBe(2)
  window.dispatchEvent(new StorageEvent("storage", { key: cartStorageKey("customer-b"), newValue: null, storageArea: localStorage }))
  expect(useCartStore.getState().items[0].quantity).toBe(2)
})

it("never assigns the old shared cart to a guest or newly signed-in account", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  const legacy = serializeCart(useCartStore.getState().items)
  useCartStore.setState({ items: [] })
  localStorage.setItem("storefront-cart-v1", legacy)
  window.dispatchEvent(new StorageEvent("storage", { key: "storefront-cart-v1", newValue: legacy, storageArea: localStorage }))
  expect(useCartStore.getState().items).toEqual([])
  signIn("new-customer")
  expect(useCartStore.getState().items).toEqual([])
  expect(localStorage.getItem("storefront-cart-v1")).toBe(legacy)
})

it("keeps account carts separate when browser storage cannot be written", () => {
  const originalWrite = Storage.prototype.setItem
  const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key.startsWith("storefront-cart-v2:")) throw new Error("Storage disabled")
    originalWrite.call(this, key, value)
  })
  try {
    signIn("offline-a")
    useCartStore.getState().addItem(product, "red", 1)
    signIn("offline-b")
    expect(useCartStore.getState().items).toEqual([])
    useCartStore.getState().addItem(product, "blue", 2)
    signIn("offline-a")
    expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", quantity: 1 })
  } finally { write.mockRestore() }
})

it("persists cart contents without purchase selection and restores changes from another tab", () => {
  useCartStore.getState().addItem(product, "blue", 2)
  const saved = window.localStorage.getItem(CART_STORAGE_KEY)!
  expect(JSON.parse(saved).items[0]).toMatchObject({ quantity: 2, variantKey: "blue" })
  expect(saved).not.toContain('"selected"')
  useCartStore.getState().clearSelection()
  const before = useCartStore.getState().items
  appendCartOperation(localStorage, before, before.map(item => ({ ...item, quantity: 3 })), "other-tab-add")
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: CART_OPERATION_PREFIX + "other-tab-add", storageArea: window.localStorage })))
  expect(useCartStore.getState().items[0]).toMatchObject({ quantity: 3, variantKey: "blue", unitPrice: 180000, selected: false })
  expect(useCartStore.getState().items[0].quantity).toBe(3)
  appendCartOperation(localStorage, useCartStore.getState().items, [], "other-tab-remove")
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: CART_OPERATION_PREFIX + "other-tab-remove", storageArea: window.localStorage })))
  expect(useCartStore.getState().items).toEqual([])
})

it("ignores corrupted stored carts without clearing valid items", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  const before = useCartStore.getState().items
  for (const newValue of ['invalid json', '{"version":1,"items":[{"quantity":-1}]}']) {
    act(() => window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY, newValue, storageArea: window.localStorage })))
    expect(useCartStore.getState().items).toBe(before)
  }
})

it("opens checkout only after choosing a product", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  render(<MemoryRouter initialEntries={["/cart"]}><Routes>
    <Route path="/cart" element={<CartPage />} />
    <Route path="/checkout" element={<p>Trang thanh toán</p>} />
  </Routes></MemoryRouter>)
  expect((screen.getByRole("button", { name: "Mua hàng (0)" }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  fireEvent.click(screen.getByRole("button", { name: "Mua hàng (1)" }))
  expect(screen.getByText("Trang thanh toán")).toBeTruthy()
})

it("requires confirmation and deletes only selected products", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  useCartStore.getState().addItem(product, "red", 1)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  expect((screen.getByRole("button", { name: "Xóa sản phẩm" }) as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByRole("checkbox", { name: "Chọn mua Sản phẩm thử · Xanh" }))
  fireEvent.click(screen.getByRole("button", { name: "Xóa sản phẩm" }))
  expect(screen.getByText("Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?")).toBeTruthy()
  expect(useCartStore.getState().items).toHaveLength(2)
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }))
  expect(useCartStore.getState().items).toHaveLength(2)
  fireEvent.click(screen.getByRole("button", { name: "Xóa sản phẩm" }))
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", quantity: 1, selected: false })
})

it("clears selection when returning to the cart after continuing shopping", () => {
  useCartStore.getState().addItem(product, "blue", 2)
  render(<MemoryRouter initialEntries={["/cart"]}><Routes>
    <Route path="/cart" element={<CartPage />} />
    <Route path="/shop" element={<Link to="/cart">Quay lại giỏ</Link>} />
  </Routes></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  expect(useCartStore.getState().items[0].selected).toBe(true)
  fireEvent.click(screen.getAllByRole("link", { name: "Tiếp tục mua sắm" })[0])
  fireEvent.click(screen.getByRole("link", { name: "Quay lại giỏ" }))
  expect(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }).getAttribute("aria-pressed")).toBe("false")
  expect(useCartStore.getState().items[0]).toMatchObject({ selected: false, quantity: 2 })
  expect(screen.getByRole("complementary").textContent).toContain("0 ₫")
})

it("selects every product and recalculates the summary when selecting all", () => {
  const { addItem, setSelected } = useCartStore.getState()
  addItem(product, "blue", 1)
  addItem(product, "red", 1)
  setSelected(product._id, "blue", false)
  setSelected(product._id, "red", false)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  for (const checkbox of screen.getAllByRole("checkbox")) expect((checkbox as HTMLInputElement).checked).toBe(true)
  expect(screen.getByRole("complementary", { name: "Chi tiết đơn hàng" }).textContent).toContain("270.000 ₫")
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  for (const checkbox of screen.getAllByRole("checkbox")) expect((checkbox as HTMLInputElement).checked).toBe(false)
  expect(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }).getAttribute("aria-pressed")).toBe("false")
  expect(screen.getByRole("complementary", { name: "Chi tiết đơn hàng" }).textContent).toContain("0 ₫")
})

it("totals only selected products and shows zero when none are selected", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  useCartStore.getState().addItem(product, "red", 1)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  const summary = screen.getByRole("complementary", { name: "Chi tiết đơn hàng" })
  expect(summary.textContent).toContain("270.000 ₫")
  fireEvent.click(screen.getByRole("checkbox", { name: "Chọn mua Sản phẩm thử · Xanh" }))
  expect(summary.textContent).toContain("90.000 ₫")
  fireEvent.click(screen.getByRole("button", { name: "Tăng số lượng Sản phẩm thử · Xanh" }))
  expect(summary.textContent).toContain("90.000 ₫")
  fireEvent.click(screen.getByRole("checkbox", { name: "Chọn mua Sản phẩm thử · Đỏ" }))
  expect(summary.textContent).toContain("0 ₫")
  expect(screen.getByText("Vui lòng chọn sản phẩm muốn mua.")).toBeTruthy()
  fireEvent.click(screen.getByRole("checkbox", { name: "Chọn mua Sản phẩm thử · Xanh" }))
  expect(summary.textContent).toContain("360.000 ₫")
})

it("retains deselection when quantity or variant changes and selects a merged line if either source is selected", () => {
  const { addItem, setSelected, setQuantity, changeVariant } = useCartStore.getState()
  addItem(product, "blue", 1)
  setSelected(product._id, "blue", false)
  setQuantity(product._id, "blue", 2)
  expect(useCartStore.getState().items[0].selected).toBe(false)
  expect(changeVariant(product._id, "blue", "red")).toBeNull()
  expect(useCartStore.getState().items[0].selected).toBe(false)
  addItem(product, "blue", 1)
  expect(changeVariant(product._id, "red", "blue")).toBeNull()
  expect(useCartStore.getState().items[0]).toMatchObject({ selected: true, quantity: 3 })
})

it("keeps the product when removal is cancelled", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Xóa Sản phẩm thử · Xanh khỏi giỏ hàng" }))
  expect(screen.getByRole("dialog")).toBeTruthy()
  fireEvent.click(screen.getByRole("button", { name: "Hủy" }))
  expect(useCartStore.getState().items).toHaveLength(1)
})

it("keeps the unit price and updates subtotal with quantity controls, respecting minimum and stock", () => {
  useCartStore.getState().addItem({ ...product, minimumOrderQuantity: 2 }, "blue", 2)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  const decrease = screen.getByRole("button", { name: "Giảm số lượng Sản phẩm thử · Xanh" }) as HTMLButtonElement
  const increase = screen.getByRole("button", { name: "Tăng số lượng Sản phẩm thử · Xanh" }) as HTMLButtonElement
  expect(decrease.disabled).toBe(true)
  fireEvent.click(increase)
  expect(screen.getByText("180.000 ₫")).toBeTruthy()
  expect(screen.getAllByText("540.000 ₫")).toBeTruthy()
  expect(increase.disabled).toBe(true)
  fireEvent.click(increase)
  expect(useCartStore.getState().items[0].quantity).toBe(3)
  fireEvent.click(decrease)
  expect(screen.getByText("180.000 ₫")).toBeTruthy()
  expect(screen.getAllByText("360.000 ₫")).toBeTruthy()
  expect(decrease.disabled).toBe(true)
})

it("rejects invalid quantity updates without modifying the cart", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  const before = useCartStore.getState().items
  for (const quantity of [0, -1, 1.5, NaN, Infinity, 4]) {
    expect(useCartStore.getState().setQuantity(product._id, "blue", quantity)).toBeTruthy()
    expect(useCartStore.getState().items).toBe(before)
  }
})

it("discards unconfirmed variant changes when the dialog is closed", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Biến thể của Sản phẩm thử" }))
  fireEvent.click(screen.getByRole("radio", { name: "Đỏ" }))
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }))
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "blue", unitPrice: 180000 })
})

it("updates the selected variant and its discounted price in the cart", () => {
  useCartStore.getState().addItem(product, "blue", 1)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  fireEvent.click(screen.getByRole("button", { name: "Biến thể của Sản phẩm thử" }))
  fireEvent.click(screen.getByRole("radio", { name: "Đỏ" }))
  expect(useCartStore.getState().items[0].variantKey).toBe("blue")
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  expect(screen.queryByText("180.000 ₫")).toBeNull()
  expect(screen.getAllByText("90.000 ₫").length).toBe(3)
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", quantity: 1, unitPrice: 90000 })
})

it("merges an existing target variant and preserves the original cart when stock is insufficient", () => {
  const { addItem, changeVariant } = useCartStore.getState()
  addItem(product, "blue", 1)
  addItem(product, "red", 1)
  expect(changeVariant(product._id, "blue", "red")).toBeNull()
  expect(useCartStore.getState().items).toHaveLength(1)
  expect(useCartStore.getState().items[0]).toMatchObject({ variantKey: "red", quantity: 2 })
  addItem(product, "blue", 1)
  const before = useCartStore.getState().items
  expect(changeVariant(product._id, "blue", "red")).toBeTruthy()
  expect(changeVariant(product._id, "blue", "missing")).toBeTruthy()
  expect(useCartStore.getState().items).toBe(before)
})

it("merges only matching variants and rejects cumulative quantities above stock", () => {
  const { addItem } = useCartStore.getState()
  expect(addItem(product, "blue", 1)).toBeNull()
  expect(addItem(product, "blue", 2)).toBeNull()
  expect(addItem(product, "red", 1)).toBeNull()
  expect(addItem(product, "blue", 1)).toBeTruthy()
  expect(useCartStore.getState().items.map(item => [item.variantKey, item.quantity, item.unitPrice])).toEqual([
    ["blue", 3, 180000], ["red", 1, 90000],
  ])
})

it("rejects missing variants, invalid quantities, unavailable prices and stopped products", () => {
  const { addItem } = useCartStore.getState()
  expect(addItem(product, "missing", 1)).toBeTruthy()
  for (const quantity of [0, -1, 1.5, NaN]) expect(addItem(product, "blue", quantity)).toBeTruthy()
  expect(addItem({ ...product, minimumOrderQuantity: 2 }, "blue", 1)).toBeTruthy()
  expect(addItem({ ...product, variants: [], price: undefined }, "", 1)).toBeTruthy()
  expect(addItem({ ...product, on_sale: false }, "blue", 1)).toBeTruthy()
  expect(useCartStore.getState().items).toEqual([])
})

it("shows added product details in the cart and returns to empty state after removal", () => {
  useCartStore.getState().addItem(product, "blue", 2)
  render(<MemoryRouter><CartPage /></MemoryRouter>)
  fireEvent.click(screen.getByRole("button", { name: "Chọn tất cả sản phẩm" }))
  expect(screen.getByRole("button", { name: "Biến thể của Sản phẩm thử" })).toBeTruthy()
  expect(screen.queryByText(/Số lượng:/)).toBeNull()
  expect(screen.getByText("180.000 ₫")).toBeTruthy()
  expect(screen.getAllByText("360.000 ₫")).toBeTruthy()
  expect(screen.getByRole("link", { name: "Sản phẩm thử" }).getAttribute("href")).toBe("/shop/san-pham")
  fireEvent.click(screen.getByRole("button", { name: "Xóa Sản phẩm thử · Xanh khỏi giỏ hàng" }))
  expect(useCartStore.getState().items).toHaveLength(1)
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }))
  expect(screen.getByText("Giỏ hàng của bạn đang trống")).toBeTruthy()
})

it("never imports the previous shared journal into guest or customer carts", () => {
  const legacy = serializeCart([{ product, productId: product._id, variantKey: "blue", quantity: 1 } as Parameters<typeof serializeCart>[0][number]])
  localStorage.setItem("storefront-cart-operation-v2:old", JSON.stringify({ id: "old", sequence: 1, changes: [{ key: JSON.stringify([product._id, "blue"]), delta: 1, snapshot: legacy }] }))
  window.dispatchEvent(new StorageEvent("storage", { key: "storefront-cart-operation-v2:old", storageArea: localStorage }))
  expect(useCartStore.getState().items).toEqual([])
  signIn("clean-customer")
  expect(useCartStore.getState().items).toEqual([])
})

import { useAuthStore } from "@/stores/auth.store"
import { create } from "zustand"
import type { CartItem } from "@/features/cart/types/cart"
import type { Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"
import { buildCartItem } from "@/features/cart/utils/cart-item"
import { CART_STORAGE_KEY, cartStorageKey, parseStoredCart, serializeCart } from "@/features/cart/utils/cart-storage"
import { appendCartOperation, readCartJournal, CART_OPERATION_PREFIX } from "@/features/cart/utils/cart-journal"

let operationId: string | undefined
let pendingOperations: { before: CartItem[]; after: CartItem[]; id: string }[] = []

interface CartState {
  refreshProducts: (products: Product[], missingSlugs?: string[]) => void
  consumePurchasedItems: (purchased: { productId: string; variantId?: string; quantity: number }[], requestId?: string) => void
  items: CartItem[]
  removeSelected: () => void
  selectAll: () => void
  clearSelection: () => void
  setSelected: (productId: string, variantKey: string, selected: boolean) => void
  addItem: (product: Product, variantKey: string, quantity: number) => string | null
  removeItem: (productId: string, variantKey: string) => void
  changeVariant: (productId: string, currentKey: string, nextKey: string) => string | null
  setQuantity: (productId: string, variantKey: string, quantity: number) => string | null
}

export const useCartStore = create<CartState>((set, get) => ({
  refreshProducts: (products, missingSlugs = []) => set(state => ({ items: state.items.map(item => {
    const product = products.find(current => current._id === item.productId)
    if (missingSlugs.includes(item.slug)) return { ...item, unavailableReason: "Sản phẩm không còn khả dụng." }
    if (!product) return item
    if (item.variantKey && !product.variants?.some(variant => (variant._id ?? variant.sku) === item.variantKey)) {
      return { ...item, product, unavailableReason: "Biến thể không còn khả dụng. Vui lòng chọn lại hoặc xóa sản phẩm." }
    }
    return buildCartItem(product, item.variantKey, item.quantity, item.selected) ?? { ...item, product, unavailableReason: "Vui lòng chọn lại biến thể hợp lệ." }
  }) })),
  consumePurchasedItems: (purchased, requestId) => {
    if (requestId) {
      if (pendingOperations.some(operation => operation.id === requestId)) return
      try { if (localStorage.getItem(currentOperationPrefix() + requestId)) return } catch { /* In-memory cart remains available. */ }
    }
    operationId = requestId
    try {
      set(state => ({ items: state.items.flatMap(item => {
        const bought = purchased.find(line => line.productId === item.productId && (line.variantId ?? "") === item.variantKey)
        if (!bought) return [item]
        const quantity = item.quantity - bought.quantity
        return quantity > 0 ? [{ ...item, quantity, selected: false }] : []
      }) }))
    } finally { operationId = undefined }
  },
  items: [],
  removeSelected: () => set(state => ({ items: state.items.filter(item => !item.selected) })),
  clearSelection: () => set(state => ({ items: state.items.map(item => ({ ...item, selected: false })) })),
  selectAll: () => set(state => {
    const selected = !state.items.every(item => item.selected)
    return { items: state.items.map(item => ({ ...item, selected })) }
  }),
  setSelected: (productId, variantKey, selected) => set(state => ({
    items: state.items.map(item => item.productId === productId && item.variantKey === variantKey ? { ...item, selected } : item),
  })),
  setQuantity: (productId, variantKey, quantity) => {
    const item = get().items.find(current => current.productId === productId && current.variantKey === variantKey)
    if (!item) return "Không tìm thấy sản phẩm trong giỏ hàng."
    const minimum = item.product.minimumOrderQuantity ?? 1
    if (!Number.isSafeInteger(quantity) || quantity < minimum) return `Vui lòng chọn ít nhất ${minimum} sản phẩm.`
    const variant = item.product.variants?.find(current => (current._id ?? current.sku) === variantKey)
    const stock = item.product.variants?.length ? variant?.stock ?? 0 : item.product.stock ?? 0
    if (quantity > stock) return "Số lượng trong giỏ vượt quá tồn kho hiện tại."
    set(state => ({ items: state.items.map(current => current === item ? buildCartItem(current.product, current.variantKey, quantity, current.selected) ?? current : current) }))
    return null
  },
  addItem: (product, variantKey, quantity) => {
    const variant = product.variants?.find(item => (item._id ?? item.sku) === variantKey)
    if (product.variants?.length && !variant) return "Vui lòng chọn biến thể sản phẩm."
    if (product.on_sale === false || product.is_active === false || !product.slug) return "Sản phẩm hiện không thể thêm vào giỏ."
    const key = variant ? variant._id ?? variant.sku : ""
    const minimum = product.minimumOrderQuantity ?? 1
    if (!Number.isSafeInteger(quantity) || quantity < minimum) return `Vui lòng chọn ít nhất ${minimum} sản phẩm.`
    const unitPrice = discountedPrice(variant?.price ?? product.price ?? NaN, product.discount)
    if (unitPrice === null) return "Sản phẩm chưa có giá hợp lệ."
    const items = get().items
    const existing = items.find(item => item.productId === product._id && item.variantKey === key)
    const nextQuantity = (existing?.quantity ?? 0) + quantity
    if (nextQuantity > (variant ? variant.stock ?? 0 : product.stock ?? 0)) return "Số lượng trong giỏ vượt quá tồn kho hiện tại."
    const item = buildCartItem(product, key, nextQuantity, existing?.selected ?? true)
    if (!item) return "Sản phẩm chưa có thông tin hợp lệ."
    set({ items: existing ? items.map(current => current === existing ? item : current) : [...items, item] })
    return null
  },
  removeItem: (productId, variantKey) => set(state => ({
    items: state.items.filter(item => item.productId !== productId || item.variantKey !== variantKey),
  })),
  changeVariant: (productId, currentKey, nextKey) => {
    const item = get().items.find(current => current.productId === productId && current.variantKey === currentKey)
    if (!item) return "Không tìm thấy sản phẩm trong giỏ hàng."
    if (currentKey === nextKey) return null
    if (!item.product.variants?.some(variant => (variant._id ?? variant.sku) === nextKey)) return "Biến thể không hợp lệ."
    const target = get().items.find(current => current.productId === productId && current.variantKey === nextKey)
    const error = get().addItem(item.product, nextKey, item.quantity)
    if (error) return error
    get().setSelected(productId, nextKey, item.selected || (target?.selected ?? false))
    get().removeItem(productId, currentKey)
    return null
  },
}))

// Selection stays local; immutable operations merge quantities across tabs.
let applyingStoredCart = false
const memoryCarts = new Map<string, CartItem[]>()
const scopedPending = new Map<string, typeof pendingOperations>()
function currentCartKey() {
  const user = useAuthStore.getState().user
  return cartStorageKey(user?.accountType === "customer" ? user.id : null)
}
let activeCartKey = currentCartKey()
function currentOperationPrefix() {
  return activeCartKey === CART_STORAGE_KEY ? CART_OPERATION_PREFIX : `${activeCartKey}:operation:`
}
function applyItems(items: CartItem[]) {
  const previous = useCartStore.getState().items
  applyingStoredCart = true
  try {
    useCartStore.setState({ items: items.map(item => ({ ...item,
      selected: previous.find(current => current.productId === item.productId && current.variantKey === item.variantKey)?.selected ?? false,
    })) })
  } finally { applyingStoredCart = false }
}
function restoreLegacy(value: string | null) {
  const stored = parseStoredCart(value)
  if (!stored) return
  const items = stored.flatMap(item => {
    const product = { ...item.product, category: null, brand: null }
    const built = buildCartItem(product, item.variantKey, item.quantity, false)
    return built ? [{ ...built, ...(item.unavailableReason ? { unavailableReason: item.unavailableReason } : {}) }] : []
  })
  applyItems(items)
}
// Keep stable operation IDs until persistence succeeds. Retrying after a partial
// write cannot duplicate a delta, and stale journal data never replaces a draft.
function syncCartStorage() {
  while (pendingOperations.length) {
    const operation = pendingOperations[0]
    appendCartOperation(localStorage, operation.before, operation.after, operation.id, currentOperationPrefix())
    pendingOperations.shift()
  }
  const journal = readCartJournal(localStorage, currentOperationPrefix())
  if (journal) applyItems(journal)
  memoryCarts.set(activeCartKey, useCartStore.getState().items)
  const value = serializeCart(useCartStore.getState().items)
  if (localStorage.getItem(activeCartKey) !== value) localStorage.setItem(activeCartKey, value)
}
if (typeof window !== "undefined") {
  try {
    const journal = readCartJournal(localStorage, currentOperationPrefix())
    if (journal) applyItems(journal)
    else {
      restoreLegacy(localStorage.getItem(activeCartKey))
      pendingOperations.push({ before: [], after: useCartStore.getState().items, id: "legacy-import" })
      syncCartStorage()
    }
  } catch { /* Storage may be disabled. */ }
  useCartStore.subscribe((state, previous) => {
    if (applyingStoredCart) return
    memoryCarts.set(activeCartKey, state.items)
    try {
      if (operationId || serializeCart(previous.items) !== serializeCart(state.items)) {
        pendingOperations.push({ before: previous.items, after: state.items, id: operationId ?? crypto.randomUUID() })
      }
      syncCartStorage()
    } catch { /* Keep the in-memory cart usable if storage is unavailable. */ }
  })
  useAuthStore.subscribe(() => {
    const nextKey = currentCartKey()
    if (nextKey === activeCartKey) return
    try { syncCartStorage() } catch { /* Retain pending operations for this identity. */ }
    memoryCarts.set(activeCartKey, useCartStore.getState().items)
    scopedPending.set(activeCartKey, pendingOperations)
    activeCartKey = nextKey
    pendingOperations = scopedPending.get(nextKey) ?? []
    applyingStoredCart = true
    try { useCartStore.setState({ items: (memoryCarts.get(nextKey) ?? []).map(item => ({ ...item, selected: false })) }) }
    finally { applyingStoredCart = false }
    try {
      const journal = readCartJournal(localStorage, currentOperationPrefix())
      if (journal) syncCartStorage()
      else {
        if (!memoryCarts.has(nextKey)) restoreLegacy(localStorage.getItem(nextKey))
        pendingOperations.push({ before: [], after: useCartStore.getState().items, id: "legacy-import" })
        syncCartStorage()
      }
    } catch { /* Keep each identity's in-memory cart isolated when storage is unavailable. */ }
  })
  window.addEventListener("storage", event => {
    try {
      if (event.storageArea !== localStorage) return
      if (event.key?.startsWith(currentOperationPrefix()) || event.key === null) {
        syncCartStorage()
        const journal = readCartJournal(localStorage, currentOperationPrefix())
        if (journal) applyItems(journal)
        else if (event.key === null) applyItems([])
      }
    } catch { /* Ignore unavailable storage. */ }
  })
  window.addEventListener("focus", () => {
    try { syncCartStorage() } catch { /* Retry pending operations on the next change/focus. */ }
  })
}

import { create } from "zustand"
import type { CartItem } from "@/features/cart/types/cart"
import type { Product } from "@/features/products/types/products"
import { discountedPrice } from "@/features/products/utils/product-price"
import { CART_STORAGE_KEY, parseStoredCart, serializeCart } from "@/features/cart/utils/cart-storage"

interface CartState {
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
    set(state => ({ items: state.items.map(current => current === item ? { ...current, quantity } : current) }))
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
    const item: CartItem = {
      product,
      productId: product._id, variantKey: key, slug: product.slug,
      name: product.product_name,
      variantLabel: variant ? [variant.variant_name || variant.sku, variant.color, variant.size].filter(Boolean).join(" · ") : "",
      image: variant?.image ?? product.thumbnail ?? product.images?.[0]?.secure_url ?? null,
      unitPrice, quantity: nextQuantity,
      selected: existing?.selected ?? true,
    }
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

// Selection is local to each tab; persist only public catalog snapshots and quantities.
let applyingStoredCart = false
function restoreCart(value: string | null) {
  const stored = parseStoredCart(value)
  if (!stored) return
  const previous = useCartStore.getState().items
  applyingStoredCart = true
  try {
    useCartStore.setState({ items: [] })
    for (const item of stored) {
      useCartStore.getState().addItem({ ...item.product, category: null, brand: null }, item.variantKey, item.quantity)
    }
    useCartStore.setState(state => ({ items: state.items.map(item => ({
      ...item, selected: previous.find(current => current.productId === item.productId && current.variantKey === item.variantKey)?.selected ?? false,
    })) }))
  } finally { applyingStoredCart = false }
}

if (typeof window !== "undefined") {
  try { restoreCart(window.localStorage.getItem(CART_STORAGE_KEY)) } catch { /* Storage may be disabled. */ }
  useCartStore.subscribe(state => {
    if (applyingStoredCart) return
    try {
      const value = serializeCart(state.items)
      if (window.localStorage.getItem(CART_STORAGE_KEY) !== value) window.localStorage.setItem(CART_STORAGE_KEY, value)
    } catch { /* Keep the in-memory cart usable if browser storage is unavailable. */ }
  })
  window.addEventListener("storage", event => {
    if (event.storageArea === window.localStorage && (event.key === CART_STORAGE_KEY || event.key === null)) {
      restoreCart(event.key === null ? null : event.newValue)
    }
  })
}

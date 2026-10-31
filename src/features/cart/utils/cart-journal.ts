import { z } from "zod"
import type { CartItem } from "@/features/cart/types/cart"
import { buildCartItem } from "@/features/cart/utils/cart-item"
import { parseStoredCart, serializeCart } from "@/features/cart/utils/cart-storage"

export const CART_OPERATION_PREFIX = "storefront-cart-v2:guest:operation:"
const changeSchema = z.object({ key: z.string(), delta: z.number().int().safe(), snapshot: z.string().optional() })
const operationSchema = z.object({ id: z.string(), sequence: z.number().int().nonnegative().safe(), changes: z.array(changeSchema).max(1000) })
const lineKey = (item: CartItem) => JSON.stringify([item.productId, item.variantKey])

function operations(storage: Storage, prefix: string) {
  const result: z.infer<typeof operationSchema>[] = []
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index)
    if (!key?.startsWith(prefix)) continue
    try { result.push(operationSchema.parse(JSON.parse(storage.getItem(key)!))) } catch { /* Ignore malformed entries. */ }
  }
  return result.sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id))
}

// Each operation owns a separate key. Concurrent tab writes cannot overwrite
// each other; quantities merge as deltas, including checkout stock consumption.
export function appendCartOperation(storage: Storage, before: CartItem[], after: CartItem[], id?: string, prefix = CART_OPERATION_PREFIX) {
  if (id && storage.getItem(prefix + id)) return
  const previous = new Map(before.map(item => [lineKey(item), item]))
  const current = new Map(after.map(item => [lineKey(item), item]))
  const changes = [...new Set([...previous.keys(), ...current.keys()])].flatMap(key => {
    const old = previous.get(key), next = current.get(key)
    const snapshot = next ? serializeCart([{ ...next, quantity: 1 }]) : undefined
    const metadataChanged = !!next && (!old || snapshot !== serializeCart([{ ...old, quantity: 1 }]))
    const delta = (next?.quantity ?? 0) - (old?.quantity ?? 0)
    if (!delta && !metadataChanged) return []
    return [{ key, delta, ...(metadataChanged ? { snapshot } : {}) }]
  })
  if (!changes.length && !id) return
  const sequence = Math.max(0, ...operations(storage, prefix).map(value => value.sequence)) + 1
  const operationId = id ?? crypto.randomUUID()
  storage.setItem(prefix + operationId, JSON.stringify({ id: operationId, sequence, changes }))
}

export function readCartJournal(storage: Storage, prefix = CART_OPERATION_PREFIX): CartItem[] | null {
  const entries = operations(storage, prefix)
  if (!entries.length) return null
  const lines = new Map<string, { quantity: number; item: CartItem }>()
  for (const entry of entries) for (const change of entry.changes) {
    const stored = change.snapshot ? parseStoredCart(change.snapshot)?.[0] : undefined
    let item = lines.get(change.key)?.item
    if (stored) {
      const product = { ...stored.product, category: null, brand: null }
      const built = buildCartItem(product, stored.variantKey, stored.quantity, false)
      if (built) delete built.unavailableReason // Recompute quantity-dependent availability after merging all deltas.
      item = built
        ?? { ...stored, product, productId: product._id, slug: product.slug, name: product.product_name, variantLabel: stored.variantKey, unitPrice: 0, image: product.thumbnail ?? null, selected: false, unavailableReason: "Biến thể không còn khả dụng. Vui lòng chọn lại hoặc xóa sản phẩm." }
      if (stored.unavailableReason) item = { ...item, unavailableReason: stored.unavailableReason }
    }
    if (!item) continue
    if (lineKey(item) !== change.key) continue
    lines.set(change.key, { quantity: Math.max(0, (lines.get(change.key)?.quantity ?? 0) + change.delta), item })
  }
  return [...lines.values()].filter(line => Number.isSafeInteger(line.quantity) && line.quantity > 0).map(({ quantity, item }) =>
    ({ ...(buildCartItem(item.product, item.variantKey, quantity, false) ?? { ...item, quantity }), ...(item.unavailableReason ? { unavailableReason: item.unavailableReason } : {}) }))
}

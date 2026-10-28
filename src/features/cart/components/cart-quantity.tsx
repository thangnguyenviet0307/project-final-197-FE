import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import type { CartItem } from "@/features/cart/types/cart"
import { useCartStore } from "@/stores/cart.store"

export function CartQuantity({ item }: { item: CartItem }) {
  const setQuantity = useCartStore(state => state.setQuantity)
  const minimum = item.product.minimumOrderQuantity ?? 1
  const variant = item.product.variants?.find(current => (current._id ?? current.sku) === item.variantKey)
  const stock = item.product.variants?.length ? variant?.stock ?? 0 : item.product.stock ?? 0
  const label = [item.name, item.variantLabel].filter(Boolean).join(" · ")
  const update = (quantity: number) => {
    const error = setQuantity(item.productId, item.variantKey, quantity)
    if (error) toast.error(error)
  }

  return <div role="group" aria-label={`Số lượng ${label}`} className="flex shrink-0 items-center self-center overflow-hidden rounded-lg border border-gray-200 bg-white">
    <button type="button" aria-label={`Giảm số lượng ${label}`} disabled={item.quantity <= minimum} onClick={() => update(item.quantity - 1)} className="flex size-8 items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"><Minus size={14} /></button>
    <span aria-live="polite" aria-atomic="true" className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
    <button type="button" aria-label={`Tăng số lượng ${label}`} disabled={item.quantity >= stock} onClick={() => update(item.quantity + 1)} className="flex size-8 items-center justify-center hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={14} /></button>
  </div>
}

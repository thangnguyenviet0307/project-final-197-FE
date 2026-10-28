import { useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { CartItem } from "@/features/cart/types/cart"
import { useCartStore } from "@/stores/cart.store"

export function CartVariantPicker({ item }: { item: CartItem }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(item.variantKey)
  const [error, setError] = useState<string | null>(null)
  const changeVariant = useCartStore(state => state.changeVariant)
  const items = useCartStore(state => state.items)
  if (!item.product.variants?.length) return null

  return <Dialog open={open} onOpenChange={nextOpen => {
    setOpen(nextOpen)
    if (nextOpen) { setSelected(item.variantKey); setError(null) }
  }}>
    <DialogTrigger aria-label={`Biến thể của ${item.name}`} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 hover:border-[#4d9210]">
      <span className="min-w-0 break-words">{item.variantLabel}</span><ChevronRight size={16} className="shrink-0" />
    </DialogTrigger>
    <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white p-5 text-gray-900 sm:max-w-md">
      <DialogTitle className="border-b border-gray-100 pb-4 pr-8 text-base font-semibold leading-6">{item.name}</DialogTitle>
      <DialogDescription className="sr-only">Chọn biến thể sản phẩm rồi bấm Xác nhận để cập nhật giỏ hàng.</DialogDescription>
      <fieldset className="space-y-3 py-2">
        <legend className="text-sm font-semibold">Chọn biến thể</legend>
        <div className="flex flex-wrap gap-2">
          {item.product.variants.map(variant => {
            const key = variant._id ?? variant.sku
            const existing = key === item.variantKey ? 0 : items.find(current => current.productId === item.productId && current.variantKey === key)?.quantity ?? 0
            const unavailable = (variant.stock ?? 0) < item.quantity + existing
            const label = [variant.variant_name || variant.sku, variant.color, variant.size].filter(Boolean).join(" · ")
            return <label key={key} className={`relative cursor-pointer rounded-lg border px-4 py-3 text-sm ${selected === key ? "border-[#4d9210] bg-green-50 text-[#4d9210]" : "border-gray-200 text-gray-600"} ${unavailable ? "cursor-not-allowed opacity-40" : "hover:border-[#4d9210]"} has-focus-visible:ring-2 has-focus-visible:ring-[#4d9210]`}>
              <input type="radio" name={`cart-variant-${item.productId}-${item.variantKey}`} value={key} checked={selected === key} disabled={unavailable} onChange={() => { setSelected(key); setError(null) }} className="sr-only" />
              {selected === key && <Check size={12} className="absolute left-0.5 top-0.5" />}
              {label}{unavailable && <span className="block text-xs">Không đủ hàng</span>}
            </label>
          })}
        </div>
      </fieldset>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <div className="border-t border-gray-100 pt-4">
        <button type="button" onClick={() => {
          const message = changeVariant(item.productId, item.variantKey, selected)
          if (message) setError(message)
          else setOpen(false)
        }} className="w-full rounded-lg bg-[#4d9210] px-4 py-3 text-sm font-semibold text-white hover:bg-[#3d750c]">Xác nhận</button>
      </div>
    </DialogContent>
  </Dialog>
}

import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, ChevronLeft, ShoppingCart } from "lucide-react"
import { CartVariantPicker } from "@/features/cart/components/cart-variant-picker"
import { CartQuantity } from "@/features/cart/components/cart-quantity"
import { CartRemoveConfirmation } from "@/features/cart/components/cart-remove-confirmation"
import { CartClearConfirmation } from "@/features/cart/components/cart-clear-confirmation"
import { useCartStore } from "@/stores/cart.store"
import { ProductImage } from "@/features/products/components/product-image"
import { formatPrice } from "@/features/products/types/products"
import { cartTotal } from "@/features/cart/utils/cart-total"

export default function CartPage() {
  const navigate = useNavigate()
  const clearSelection = useCartStore(state => state.clearSelection)
  useEffect(() => { clearSelection() }, [clearSelection])
  const items = useCartStore(state => state.items)
  const setSelected = useCartStore(state => state.setSelected)
  const selectAll = useCartStore(state => state.selectAll)
  const selectedItems = items.filter(item => item.selected)
  const total = cartTotal(selectedItems)

  return <div className="bg-[#fbfcfa] py-8 sm:py-12"><div className="store-container space-y-6">
    <nav aria-label="Breadcrumb" className="rounded-2xl border border-gray-100 bg-white p-4 sm:px-6">
      <ol className="flex items-center gap-2 whitespace-nowrap text-sm leading-5">
        <li className="flex items-center"><Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-[#4d9210]"><ChevronLeft aria-hidden="true" className="size-5 shrink-0" />Trang chủ</Link></li>
        <li aria-hidden="true" className="flex items-center text-gray-400">/</li>
        <li className="flex items-center"><h1 aria-current="page" className="font-normal text-gray-500">Giỏ hàng</h1></li>
      </ol>
    </nav>
    {items.length === 0 ? <div className="flex flex-col items-center gap-5 rounded-2xl border border-gray-100 bg-white px-5 py-16 text-center">
      <ShoppingCart className="size-12 text-[#4d9210]" />
      <p className="text-lg font-semibold">Giỏ hàng của bạn đang trống</p>
      <p className="text-sm text-gray-500">Khám phá sản phẩm và thêm vào giỏ hàng.</p>
      <Link to="/shop" className="rounded-xl bg-[#4d9210] px-6 py-3 text-sm font-semibold text-white">Khám phá sản phẩm</Link>
    </div> : <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 p-4 sm:px-6">
          <h2 className="mb-4 text-2xl font-semibold">Danh sách sản phẩm</h2>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Chọn tất cả sản phẩm" aria-pressed={selectedItems.length === items.length} onClick={selectAll} className={`flex size-5 shrink-0 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${selectedItems.length === items.length ? "border-black bg-black text-white" : "border-gray-400 bg-white"}`}>
              {selectedItems.length === items.length && <Check aria-hidden="true" size={14} strokeWidth={3} />}
            </button>
            <span className="text-sm font-semibold text-gray-900">Chọn tất cả sản phẩm</span>
          </div>
        </div>
      <ul aria-label="Sản phẩm trong giỏ hàng" className="divide-y divide-gray-100">
        {items.map(item => <li key={JSON.stringify([item.productId, item.variantKey])} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-6">
          <div className="-ml-4 flex items-start gap-4 pl-4 sm:-ml-6 sm:gap-6 sm:pl-6">
            <label className="relative mt-1 flex size-5 shrink-0 cursor-pointer">
              <input type="checkbox" aria-label={`Chọn mua ${item.name}${item.variantLabel ? ` · ${item.variantLabel}` : ""}`} checked={item.selected} onChange={event => setSelected(item.productId, item.variantKey, event.target.checked)} className="peer size-5 cursor-pointer appearance-none rounded-full border border-gray-400 bg-white checked:border-black checked:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" />
              <Check aria-hidden="true" size={14} strokeWidth={3} className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-white peer-checked:block" />
            </label>
            <Link to={`/shop/${item.slug}`}><ProductImage src={item.image} alt={item.name} className="size-16 bg-gray-50 sm:size-24" /></Link>
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <Link to={`/shop/${item.slug}`} className="break-words font-semibold hover:text-[#4d9210]">{item.name}</Link>
            <CartVariantPicker item={item} />
            {item.unavailableReason && <p role="alert" className="text-sm text-red-600">{item.unavailableReason}</p>}
            <p aria-live="polite" className="font-semibold text-red-600">{formatPrice(item.unitPrice)} ₫</p>
          </div>
          <div className="col-span-2 flex flex-col items-end justify-between gap-4 self-stretch justify-self-end sm:col-span-1">
            <CartQuantity item={item} />
            <CartRemoveConfirmation item={item} />
          </div>
        </li>)}
      </ul>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 p-4 sm:px-6">
          <Link to="/shop" className="inline-flex text-sm font-medium text-[#4d9210] underline underline-offset-4 hover:text-[#3d750c]">Tiếp tục mua sắm</Link>
          <CartClearConfirmation />
        </div>
      </div>
      <aside aria-label="Chi tiết đơn hàng" className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-lg font-semibold">Chi tiết đơn hàng</h2>
        {selectedItems.length === 0 && <p role="status" className="text-sm text-gray-500">Vui lòng chọn sản phẩm muốn mua.</p>}
        <div className="flex justify-between gap-3"><span>Tổng tiền hàng</span><span className="font-medium">{formatPrice(total)} ₫</span></div>
        <div className="flex justify-between gap-3 border-t border-gray-100 pt-5"><span>Tổng thanh toán</span><span className="font-bold text-red-600">{formatPrice(total)} ₫</span></div>
        <button type="button" disabled={selectedItems.length === 0} onClick={() => navigate("/checkout")} className="block w-full rounded-xl bg-[#4d9210] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#3d750c] disabled:cursor-not-allowed disabled:opacity-60">Mua hàng ({selectedItems.length})</button>
      </aside>
    </div>}
  </div></div>
}

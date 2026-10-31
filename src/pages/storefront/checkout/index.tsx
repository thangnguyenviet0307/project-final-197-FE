import { useState } from "react"
import { FormProvider } from "react-hook-form"
import { ArrowRight, Banknote, Check, ChevronLeft, LoaderCircle, Wallet } from "lucide-react"
import { Link } from "react-router-dom"
import { ProductImage } from "@/features/products/components/product-image"
import { formatPrice } from "@/features/products/types/products"
import { useCartStore } from "@/stores/cart.store"
import { CheckoutCustomerInformation } from "@/features/checkout/components/checkout-customer-information"
import { useAuthStore } from "@/stores/auth.store"
import type { User } from "@/features/auth/types/auth"
import { useCheckoutForm } from "@/features/checkout/hooks/use-checkout-form"
import { cartTotal } from "@/features/cart/utils/cart-total"
import { useUnsavedForm } from "@/hooks/use-unsaved-form"
import { useRefreshCheckoutProducts } from "@/features/checkout/hooks/use-checkout"
import { getApiError } from "@/services/api"
import { useProfile } from "@/features/profile/hooks/use-profile"

export default function CheckoutPage() {
  const user = useAuthStore(state => state.user)
  const loading = useAuthStore(state => state.isLoading)
  if (loading) return <p role="status" className="store-container py-12">Đang tải thông tin khách hàng…</p>
  return user?.accountType === "customer" ? <CustomerCheckout key={user.id} customer={user} /> : <CheckoutScreen key="guest" customer={null} />
}

function CustomerCheckout({ customer }: { customer: User }) {
  const profile = useProfile()
  return <CheckoutScreen customer={profile.data ?? customer} />
}

function CheckoutScreen({ customer }: { customer: User | null }) {
  const { form, submit, mutation, needsRecovery, locations, recoveryRequest } = useCheckoutForm(customer)
  const refreshProducts = useRefreshCheckoutProducts()
  const navigation = useUnsavedForm(!mutation.isSuccess && (form.formState.isDirty || mutation.isPending || needsRecovery))
  const [showAllProducts, setShowAllProducts] = useState(false)
  const items = useCartStore(state => state.items)
  const selectedItems = items.filter(item => item.selected)
  const selectedQuantity = selectedItems.reduce((total, item) => total + item.quantity, 0)
  const merchandiseTotal = cartTotal(selectedItems)

  if (mutation.isSuccess) return (
    <div className="bg-gray-100 py-12"><section className="store-container"><div role="status" className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
      <h1 className="text-xl font-semibold">Đặt hàng thành công</h1>
      <p>Mã đơn hàng: <strong>{mutation.data.orderCode}</strong></p>
      <p>Tổng tiền: <strong className="text-red-600">{formatPrice(mutation.data.totalAmount)} ₫</strong></p>
      <p className="text-sm text-gray-600">Bạn sẽ thanh toán khi nhận hàng.</p>
      {customer ? <Link to="/account/orders" className="inline-block font-medium text-[#4d9210] underline">Xem lịch sử đơn hàng</Link>
        : <><p className="text-sm text-gray-600">Vui lòng lưu mã đơn hàng để liên hệ cửa hàng khi cần hỗ trợ. Đơn mua không đăng nhập không xuất hiện trong lịch sử tài khoản.</p><Link to="/shop" className="inline-block font-medium text-[#4d9210] underline">Tiếp tục mua sắm</Link></>}
    </div></section></div>
  )

  if (recoveryRequest) return <FormProvider {...form}>
    <section className="store-container space-y-5 py-12">
      <h1 className="text-xl font-semibold">Kiểm tra yêu cầu đặt hàng chưa xác nhận</h1>
      <p role="status">Bấm Thử lại để kiểm tra đúng yêu cầu đã gửi. Thay đổi giỏ hàng hiện tại không thay đổi yêu cầu này.</p>
      <p>Người nhận: {recoveryRequest.recipientName} · {recoveryRequest.phone}</p>
      <p>Địa chỉ nhà: {recoveryRequest.street}</p>
      <ul className="space-y-3">{recoveryRequest.items.map((line, index) => {
        const current = items.find(item => item.productId === line.productId && item.variantKey === (line.variantId ?? ""))
        return <li key={index}>{current?.name ?? `Sản phẩm ${line.productId}`} {current?.variantLabel || line.variantId || ""} · Số lượng: {line.quantity} · Đơn giá đã gửi: {formatPrice(line.expectedUnitPrice)} ₫</li>
      })}</ul>
      <p>Tổng tiền sẽ hiển thị sau khi hệ thống xác nhận kết quả.</p>
      <form onSubmit={submit}><button type="submit" disabled={mutation.isPending} className="rounded-lg bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{mutation.isPending ? "Đang kiểm tra…" : "Thử lại"}</button></form>
      {form.formState.errors.root && <p role="alert" className="text-sm text-red-600">{form.formState.errors.root.message}</p>}
      {customer && <Link to="/account/orders" className="block text-[#4d9210] underline">Kiểm tra lịch sử đơn hàng</Link>}
      {navigation.guard}
    </section>
  </FormProvider>

  return (
    <FormProvider {...form}>
    <form noValidate onSubmit={submit}>
    <fieldset disabled={mutation.isPending} className="min-w-0">
    <div className="bg-gray-100 py-8 sm:py-12">
      <div className="store-container grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-gray-100 bg-white p-4 sm:px-6 lg:col-span-2">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#4d9210] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d9210]"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
            Quay lại giỏ hàng
          </Link>
          <span aria-hidden="true" className="text-gray-400">/</span>
          <h1 className="text-sm font-medium text-gray-400">
            Thông tin thanh toán
          </h1>
        </div>
        <div className="min-w-0 space-y-6">
        <section aria-labelledby="checkout-products-heading" className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <h2 id="checkout-products-heading" className="px-4 pt-4 text-base font-semibold sm:px-6 sm:pt-6">
            Sản phẩm đã chọn
          </h2>
          {selectedItems.length === 0 ? (
            <p role="status" className="p-4 text-sm text-gray-500 sm:px-6">
              Chưa có sản phẩm được chọn. Vui lòng quay lại giỏ hàng để chọn sản phẩm.
            </p>
          ) : (
            <ul id="checkout-products-list">
              {selectedItems.map((item, index) => (
                <li
                  key={JSON.stringify([item.productId, item.variantKey])}
                  aria-hidden={index > 0 && !showAllProducts}
                  inert={index > 0 && !showAllProducts}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${index === 0 || showAllProducts ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className={`flex items-start gap-4 p-4 sm:px-6 ${index > 0 ? "border-t border-gray-100" : ""}`}>
                  <ProductImage src={item.image} alt={item.name} className="size-16 shrink-0 bg-gray-50 sm:size-20" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="break-words text-sm font-semibold">{item.name}</p>
                    {item.variantLabel && <p className="text-sm text-gray-500">{item.variantLabel}</p>}
                    {item.unavailableReason && <p role="alert" className="text-sm text-red-600">{item.unavailableReason}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
                      <p className="font-semibold text-red-600"><span className="sr-only">Đơn giá: </span>{formatPrice(item.unitPrice)} ₫</p>
                      <p className="text-gray-600">Số lượng: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                    </div>
                  </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {selectedItems.length > 1 && (
            <div className="px-4 py-3 sm:px-6">
              <button
                type="button"
                aria-expanded={showAllProducts}
                aria-controls="checkout-products-list"
                onClick={() => setShowAllProducts(current => !current)}
                className="flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d9210]"
              >
                {!showAllProducts && <span className="text-gray-500">+{selectedItems.length - 1} sản phẩm khác</span>}
                <span className="font-medium text-[#4d9210] underline underline-offset-4">{showAllProducts ? "Thu gọn" : "Xem chi tiết"}</span>
              </button>
            </div>
          )}
        </section>
        <fieldset disabled={needsRecovery} className="min-w-0"><CheckoutCustomerInformation /></fieldset>
        </div>
        <div className="min-w-0 space-y-6">
        <aside aria-labelledby="checkout-order-heading" className="min-w-0 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
          <h2 id="checkout-order-heading" className="text-base font-semibold">Thông tin đơn hàng</h2>
          <dl className="space-y-4 text-sm" aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-gray-600">Số lượng sản phẩm</dt>
              <dd className="shrink-0 font-bold text-gray-900">{selectedQuantity}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-gray-600">Tổng tiền hàng</dt>
              <dd className="text-right font-bold text-gray-900">{formatPrice(merchandiseTotal)} ₫</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-gray-600">Phí vận chuyển</dt>
              <dd className="text-right font-bold text-gray-900">Miễn phí</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-4">
              <dt className="font-bold text-gray-600">TỔNG TIỀN</dt>
              <dd className="text-right text-xl font-bold text-red-600">{formatPrice(merchandiseTotal)} ₫</dd>
            </div>
          </dl>
        </aside>
        <section aria-labelledby="checkout-payment-heading" className="space-y-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700"><Wallet aria-hidden="true" className="size-5" /></div><div><h2 id="checkout-payment-heading" className="text-base font-semibold">Thanh toán</h2><p className="mt-0.5 text-xs text-gray-500">Phương thức thanh toán</p></div></div>
          <label className="relative flex items-start gap-3 rounded-xl border border-[#4d9210]/30 bg-[#4d9210]/5 p-4 text-sm text-gray-900">
            <input type="radio" name="paymentMethod" value="cod" checked readOnly className="peer sr-only" />
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#4d9210]"><Banknote aria-hidden="true" className="size-6" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">Thanh toán khi nhận hàng</span><span className="mt-1 block text-xs leading-5 text-gray-500">Thanh toán bằng tiền mặt khi nhận được đơn hàng.</span></span>
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#4d9210] text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#4d9210]"><Check aria-hidden="true" className="size-3.5" /></span>
          </label>
          <button
            type="submit"
            disabled={(!needsRecovery && (selectedItems.length === 0 || selectedItems.some(item => item.unavailableReason) || !locations.data)) || mutation.isPending || refreshProducts.isPending}
            className="w-full rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Đang đặt hàng…" : needsRecovery ? "Thử lại" : "Thanh toán"}
            {mutation.isPending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> : <ArrowRight aria-hidden="true" className="size-4" />}
          </button>
          {!customer && <p className="text-sm text-gray-600">Bạn có thể đặt hàng không cần tài khoản, hoặc <Link to="/thanh-vien?act=login" state={{ from: "/checkout" }} className="text-[#4d9210] underline">đăng nhập</Link> để sử dụng thông tin đã lưu.</p>}
          {selectedItems.length === 0 && <p className="text-sm text-gray-500">Vui lòng quay lại giỏ hàng để chọn sản phẩm.</p>}
          {form.formState.errors.root && <p role="alert" className="text-sm text-red-600">{form.formState.errors.root.message}</p>}
          {mutation.isError && !needsRecovery && <button type="button" disabled={refreshProducts.isPending} onClick={() => refreshProducts.mutate()} className="block text-sm font-medium text-[#4d9210] underline disabled:opacity-60">{refreshProducts.isPending ? "Đang cập nhật…" : "Cập nhật giá và tồn kho để xem lại"}</button>}
          {refreshProducts.isSuccess && <p role="status" className="text-sm text-gray-600">Đã cập nhật thông tin. Vui lòng kiểm tra lại giá và số lượng trước khi thanh toán; nếu cần, quay lại giỏ hàng để điều chỉnh.</p>}
          {refreshProducts.isError && <p role="alert" className="text-sm text-red-600">{getApiError(refreshProducts.error).message}</p>}
          {mutation.isError && <Link to="/account/orders" className="block text-sm text-[#4d9210] underline">Kiểm tra lịch sử đơn hàng</Link>}
        </section>
        </div>
      </div>
    </div>
    </fieldset>
    </form>
    {navigation.guard}
    </FormProvider>
  )
}

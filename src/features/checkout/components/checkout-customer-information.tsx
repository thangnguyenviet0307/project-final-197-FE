import { LocalityFields } from "@/features/checkout/components/locality-fields"
import { useFormContext } from "react-hook-form"
import type { CheckoutRecipient } from "@/features/checkout/types/checkout"

const inputClass = "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm placeholder:text-gray-400 focus:border-[#4d9210] focus:outline-none focus:ring-1 focus:ring-[#4d9210] aria-invalid:border-red-500 disabled:bg-gray-50 disabled:text-gray-400"
export function CheckoutCustomerInformation() {
  const { register, watch, setValue, formState: { errors, isSubmitted } } = useFormContext<CheckoutRecipient>()
  const fieldError = (field: keyof CheckoutRecipient) => errors[field] && <p id={`checkout-${field}-error`} role="alert" className="text-xs text-red-600">{errors[field]?.message}</p>
  return (
    <section aria-labelledby="checkout-customer-heading" className="space-y-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
      <h2 id="checkout-customer-heading" className="text-base font-semibold">Thông tin khách hàng</h2>
      <p className="text-sm text-gray-500">Bạn có thể sửa thông tin nhận hàng. Nếu đã đăng nhập, số điện thoại và địa chỉ này sẽ cập nhật vào tài khoản sau khi đặt hàng thành công.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["recipientName", "Tên người nhận", "Nhập họ và tên người nhận", "name", 100],
          ["phone", "Số điện thoại người nhận", "Nhập số điện thoại người nhận", "tel", 20],
        ] as const).map(([field, label, placeholder, autoComplete, maxLength]) => (
          <div key={field} className="space-y-2">
            <label htmlFor={`checkout-${field}`} className="block text-sm font-medium">{label}<span aria-hidden="true" className="ml-1 text-red-600 after:content-['*']" /></label>
            <input id={`checkout-${field}`} type={field === "phone" ? "tel" : "text"} autoComplete={autoComplete} maxLength={maxLength} placeholder={placeholder} aria-required="true" aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `checkout-${field}-error` : undefined} {...register(field)} className={inputClass} />
            {fieldError(field)}
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="checkout-email" className="block text-sm font-medium">Email nhận hàng<span aria-hidden="true" className="ml-1 text-red-600 after:content-['*']" /></label>
          <input id="checkout-email" aria-required="true" type="email" autoComplete="email" maxLength={254} placeholder="Nhập email nhận thông tin đơn hàng" aria-invalid={!!errors.email} aria-describedby={errors.email ? "checkout-email-error" : undefined} {...register("email")} className={inputClass} />
          {fieldError("email")}
        </div>
        <h3 className="text-sm font-medium sm:col-span-2">Địa chỉ nhận hàng</h3>
        <p className="text-xs text-gray-500 sm:col-span-2">Chọn tỉnh/thành và phường/xã theo địa chỉ sau sáp nhập.</p>
        <input type="hidden" {...register("districtCode")} />
        <LocalityFields idPrefix="checkout" provinceCode={watch("provinceCode")} wardCode={watch("wardCode")} provinceError={errors.provinceCode?.message} wardError={errors.wardCode?.message} onChange={(province, ward) => {
          setValue("provinceCode", province, { shouldDirty: true, shouldValidate: isSubmitted })
          setValue("wardCode", ward, { shouldDirty: true, shouldValidate: isSubmitted })
          setValue("districtCode", "", { shouldDirty: true })
        }} />
        <div className="space-y-2">
          <label htmlFor="checkout-street" className="block text-sm font-medium">Địa chỉ nhà<span aria-hidden="true" className="ml-1 text-red-600 after:content-['*']" /></label>
          <input id="checkout-street" autoComplete="street-address" maxLength={255} placeholder="Nhập địa chỉ nhà" aria-required="true" aria-invalid={!!errors.street} aria-describedby={errors.street ? "checkout-street-error" : undefined} {...register("street")} className={inputClass} />
          {fieldError("street")}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="checkout-note" className="block text-sm font-medium">Ghi chú <span className="font-normal text-gray-400">(nếu có)</span></label>
        <textarea id="checkout-note" rows={3} maxLength={1000} placeholder="Nhập ghi chú" aria-invalid={!!errors.note} aria-describedby={errors.note ? "checkout-note-error" : undefined} {...register("note")} className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-[#4d9210] focus:outline-none focus:ring-1 focus:ring-[#4d9210]" />
        {fieldError("note")}
      </div>
    </section>
  )
}

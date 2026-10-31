import { useFormContext } from "react-hook-form"
import type { CheckoutRecipient } from "@/features/checkout/types/checkout"
import { useCheckoutLocations } from "@/features/checkout/hooks/use-checkout"
import { getApiError } from "@/services/api"

const inputClass = "h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm placeholder:text-gray-400 focus:border-[#4d9210] focus:outline-none focus:ring-1 focus:ring-[#4d9210] aria-invalid:border-red-500 disabled:bg-gray-50 disabled:text-gray-400"
export function CheckoutCustomerInformation() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<CheckoutRecipient>()
  const locations = useCheckoutLocations()
  const provinceCode = watch("provinceCode")
  const province = locations.data?.find(item => String(item.code) === provinceCode)
  const wards = province?.districts.flatMap(district => district.wards) ?? []
  const fieldError = (field: keyof CheckoutRecipient) => errors[field] && <p id={`checkout-${field}-error`} role="alert" className="text-xs text-red-600">{errors[field]?.message}</p>
  return (
    <section aria-labelledby="checkout-customer-heading" className="space-y-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6">
      <h2 id="checkout-customer-heading" className="text-base font-semibold">Thông tin khách hàng</h2>
      <p className="text-sm text-gray-500">Bạn có thể sửa thông tin nhận hàng. Nếu đã đăng nhập, số điện thoại và địa chỉ còn thiếu sẽ được lưu vào tài khoản sau khi đặt hàng thành công.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {([
          ["recipientName", "Tên người nhận", "Nhập họ và tên người nhận", "name", 100],
          ["phone", "Số điện thoại người nhận", "Nhập số điện thoại người nhận", "tel", 20],
        ] as const).map(([field, label, placeholder, autoComplete, maxLength]) => (
          <div key={field} className="space-y-2">
            <label htmlFor={`checkout-${field}`} className="block text-sm font-medium">{label}</label>
            <input id={`checkout-${field}`} type={field === "phone" ? "tel" : "text"} autoComplete={autoComplete} maxLength={maxLength} placeholder={placeholder} aria-required="true" aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `checkout-${field}-error` : undefined} {...register(field)} className={inputClass} />
            {fieldError(field)}
          </div>
        ))}
        <h3 className="text-sm font-medium sm:col-span-2">Địa chỉ nhận hàng</h3>
        <p className="text-xs text-gray-500 sm:col-span-2">Chọn tỉnh/thành và phường/xã theo danh sách địa phương trước sáp nhập 07/2025.</p>
        <input type="hidden" {...register("districtCode")} />
        {locations.isPending && <p role="status" className="text-sm text-gray-500 sm:col-span-2">Đang tải danh sách địa phương…</p>}
        {locations.isError && <div role="alert" className="text-sm text-red-600 sm:col-span-2">{getApiError(locations.error).message} <button type="button" onClick={() => void locations.refetch()} className="underline">Thử lại</button></div>}
        {([
          ["provinceCode", "Tỉnh/Thành phố", locations.data ?? [], !locations.data],
          ["wardCode", "Phường/Xã", wards, !province],
        ] as const).map(([field, label, options, disabled]) => (
          <div key={field} className="space-y-2">
            <label htmlFor={`checkout-${field}`} className="block text-sm font-medium">{label}</label>
            <select id={`checkout-${field}`} value={watch(field)} disabled={disabled} aria-required="true" aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `checkout-${field}-error` : undefined} {...register(field, { onChange: () => {
              if (field === "provinceCode") {
                setValue("districtCode", "", { shouldDirty: true })
                setValue("wardCode", "", { shouldDirty: true })
              } else {
                const district = province?.districts.find(item => item.wards.some(ward => String(ward.code) === watch("wardCode")))
                setValue("districtCode", district ? String(district.code) : "", { shouldDirty: true, shouldValidate: true })
              }
            } })} className={inputClass}>
              <option value="">Chọn {label.toLowerCase()}</option>
              {options.map(option => <option key={option.code} value={String(option.code)}>{option.name}</option>)}
            </select>
            {fieldError(field)}
            {field === "wardCode" && fieldError("districtCode")}
          </div>
        ))}
        <div className="space-y-2">
          <label htmlFor="checkout-street" className="block text-sm font-medium">Địa chỉ nhà</label>
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

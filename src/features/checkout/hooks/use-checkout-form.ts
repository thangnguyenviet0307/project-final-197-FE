import { useEffect, useRef, useState, type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkoutRecipientSchema } from "@/features/checkout/schemas/checkout-schema"
import { useCheckout, useCheckoutLocations } from "@/features/checkout/hooks/use-checkout"
import type { CheckoutRecipient, CheckoutRequest } from "@/features/checkout/types/checkout"
import type { User } from "@/features/auth/types/auth"
import { useCartStore } from "@/stores/cart.store"
import { getApiError } from "@/services/api"
import { checkoutValuesFromProfile } from "@/features/checkout/utils/checkout-profile"
import { useAuthStore } from "@/stores/auth.store"
import { readPendingCheckout, savePendingCheckout, clearPendingCheckout } from "@/features/checkout/utils/pending-checkout"

export function useCheckoutForm(customer: User | null) {
  const scope = customer?.id ?? "guest"
  const mutation = useCheckout()
  const locations = useCheckoutLocations()
  const [restored] = useState(() => readPendingCheckout(scope))
  const attempt = useRef<CheckoutRequest | null>(restored)
  const sending = useRef(false)
  const [recoveryRequest, setRecoveryRequest] = useState<CheckoutRequest | null>(restored)
  const needsRecovery = recoveryRequest !== null
  const form = useForm<CheckoutRecipient>({
    resolver: zodResolver(checkoutRecipientSchema),
    defaultValues: restored ? { ...restored, provinceCode: String(restored.provinceCode), districtCode: String(restored.districtCode), wardCode: String(restored.wardCode) } : checkoutValuesFromProfile(customer),
  })
  const { dirtyFields } = form.formState
  useEffect(() => {
    if (sending.current || attempt.current) return
    const defaults = checkoutValuesFromProfile(customer, locations.data)
    // Keep the entire locality selection together when the customer edits it.
    const localityDirty = dirtyFields.provinceCode || dirtyFields.districtCode || dirtyFields.wardCode
    const current = form.getValues()
    for (const field of Object.keys(defaults) as (keyof CheckoutRecipient)[]) {
      if (dirtyFields[field] || (localityDirty && ["provinceCode", "districtCode", "wardCode"].includes(field))) defaults[field] = current[field]
    }
    if (Object.keys(defaults).some(field => defaults[field as keyof CheckoutRecipient] !== current[field as keyof CheckoutRecipient])) {
      form.reset(defaults, { keepDirtyValues: true })
    }
  }, [customer, locations.data, form, dirtyFields])
  const submit = (event?: BaseSyntheticEvent) => form.handleSubmit(async values => {
    if (sending.current) return
    form.clearErrors("root")
    if (customer && (useAuthStore.getState().user?.accountType !== "customer" || useAuthStore.getState().user?.id !== customer.id)) { form.setError("root", { message: "Vui lòng đăng nhập tài khoản khách hàng để đặt hàng." }); return }
    const items = useCartStore.getState().items.filter(item => item.selected)
    if (!attempt.current) {
      if (!items.length) { form.setError("root", { message: "Vui lòng chọn sản phẩm trong giỏ hàng." }); return }
      if (items.length > 100) { form.setError("root", { message: "Mỗi đơn hàng tối đa 100 dòng sản phẩm. Vui lòng chia thành các đơn nhỏ hơn." }); return }
      if (items.some(item => item.unavailableReason)) { form.setError("root", { message: "Vui lòng xử lý sản phẩm không khả dụng trong giỏ hàng trước khi đặt." }); return }
      const province = locations.data?.find(item => String(item.code) === values.provinceCode)
      const district = province?.districts.find(item => String(item.code) === values.districtCode)
      if (!district?.wards.some(item => String(item.code) === values.wardCode)) { form.setError("wardCode", { message: "Vui lòng chọn lại địa chỉ nhận hàng hợp lệ." }); return }
      attempt.current = { ...values, provinceCode: Number(values.provinceCode), districtCode: Number(values.districtCode), wardCode: Number(values.wardCode), paymentMethod: "cod", requestId: crypto.randomUUID(), items: items.map(item => ({ productId: item.productId, ...(item.variantKey ? { variantId: item.variantKey } : {}), quantity: item.quantity, expectedUnitPrice: item.unitPrice })) }
    }
    try { savePendingCheckout(scope, attempt.current) }
    catch (error) {
      if (!needsRecovery) attempt.current = null
      form.setError("root", { message: getApiError(error).message })
      return
    }
    sending.current = true
    try {
      await mutation.mutateAsync(attempt.current)
      clearPendingCheckout(scope)
      attempt.current = null
      setRecoveryRequest(null)
    } catch (error) {
      const failure = getApiError(error)
      const uncertain = failure.statusCode === 0 || failure.statusCode === 408 || failure.statusCode >= 500 || (needsRecovery && [401, 403, 429].includes(failure.statusCode))
      setRecoveryRequest(uncertain ? attempt.current : null)
      if (!uncertain) { attempt.current = null; clearPendingCheckout(scope) }
      form.setError("root", { message: uncertain ? "Chưa xác nhận được kết quả đặt hàng. Bấm Thử lại để kiểm tra cùng yêu cầu, tránh tạo trùng đơn. Bạn cũng có thể kiểm tra lịch sử đơn hàng." : failure.message })
      failure.errors?.forEach(issue => {
        if (issue.field in values) form.setError(issue.field as keyof CheckoutRecipient, { message: issue.message })
      })
    } finally { sending.current = false }
  })(event)
  return { form, submit, mutation, needsRecovery, locations, recoveryRequest }
}

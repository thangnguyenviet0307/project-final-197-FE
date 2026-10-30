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

export function useCheckoutForm(customer: User | null) {
  const mutation = useCheckout()
  const locations = useCheckoutLocations()
  const attempt = useRef<CheckoutRequest | null>(null)
  const sending = useRef(false)
  const [needsRecovery, setNeedsRecovery] = useState(false)
  const form = useForm<CheckoutRecipient>({
    resolver: zodResolver(checkoutRecipientSchema),
    defaultValues: checkoutValuesFromProfile(customer),
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
    const items = useCartStore.getState().items.filter(item => item.selected)
    if (!attempt.current) {
      if (!items.length) { form.setError("root", { message: "Vui lòng chọn sản phẩm trong giỏ hàng." }); return }
      const province = locations.data?.find(item => String(item.code) === values.provinceCode)
      const district = province?.districts.find(item => String(item.code) === values.districtCode)
      if (!district?.wards.some(item => String(item.code) === values.wardCode)) { form.setError("wardCode", { message: "Vui lòng chọn lại địa chỉ nhận hàng hợp lệ." }); return }
      attempt.current = { ...values, provinceCode: Number(values.provinceCode), districtCode: Number(values.districtCode), wardCode: Number(values.wardCode), paymentMethod: "cod", requestId: crypto.randomUUID(), items: items.map(item => ({ productId: item.productId, ...(item.variantKey ? { variantId: item.variantKey } : {}), quantity: item.quantity, expectedUnitPrice: item.unitPrice })) }
    }
    sending.current = true
    try {
      await mutation.mutateAsync(attempt.current)
      attempt.current = null
      setNeedsRecovery(false)
    } catch (error) {
      const failure = getApiError(error)
      const uncertain = failure.statusCode === 0 || failure.statusCode >= 500
      setNeedsRecovery(uncertain)
      if (!uncertain) attempt.current = null
      form.setError("root", { message: uncertain ? "Chưa xác nhận được kết quả đặt hàng. Bấm Thử lại để kiểm tra cùng yêu cầu, tránh tạo trùng đơn." : failure.message })
      failure.errors?.forEach(issue => {
        if (issue.field in values) form.setError(issue.field as keyof CheckoutRecipient, { message: issue.message })
      })
    } finally { sending.current = false }
  })(event)
  return { form, submit, mutation, needsRecovery, locations }
}

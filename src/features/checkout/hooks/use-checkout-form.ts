import { useRef, useState, type BaseSyntheticEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkoutRecipientSchema } from "@/features/checkout/schemas/checkout-schema"
import { useCheckout, useCheckoutLocations } from "@/features/checkout/hooks/use-checkout"
import type { CheckoutRecipient, CheckoutRequest } from "@/features/checkout/types/checkout"
import type { User } from "@/features/auth/types/auth"
import { useCartStore } from "@/stores/cart.store"
import { useAuthStore } from "@/stores/auth.store"
import { getApiError } from "@/services/api"

export function useCheckoutForm(customer: User | null) {
  const mutation = useCheckout()
  const locations = useCheckoutLocations()
  const attempt = useRef<CheckoutRequest | null>(null)
  const sending = useRef(false)
  const [needsRecovery, setNeedsRecovery] = useState(false)
  const form = useForm<CheckoutRecipient>({
    resolver: zodResolver(checkoutRecipientSchema),
    defaultValues: { recipientName: customer?.shippingAddress?.recipientName ?? customer?.name ?? "", phone: customer?.phone ?? "", provinceCode: "", districtCode: "", wardCode: "", street: customer?.shippingAddress?.street ?? "", note: "" },
  })
  const submit = (event?: BaseSyntheticEvent) => form.handleSubmit(async values => {
    if (sending.current) return
    form.clearErrors("root")
    if (useAuthStore.getState().user?.accountType !== "customer") { form.setError("root", { message: "Vui lòng đăng nhập tài khoản khách hàng để đặt hàng." }); return }
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
      form.setError("root", { message: uncertain ? "Chưa xác nhận được kết quả đặt hàng. Bấm Thử lại để kiểm tra cùng yêu cầu, tránh tạo trùng đơn. Bạn cũng có thể kiểm tra lịch sử đơn hàng." : failure.message })
      failure.errors?.forEach(issue => {
        if (issue.field in values) form.setError(issue.field as keyof CheckoutRecipient, { message: issue.message })
      })
    } finally { sending.current = false }
  })(event)
  return { form, submit, mutation, needsRecovery, locations }
}

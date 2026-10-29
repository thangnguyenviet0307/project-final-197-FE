export interface CheckoutPlace { code: number; name: string }
export interface CheckoutDistrict extends CheckoutPlace { wards: CheckoutPlace[] }
export interface CheckoutProvince extends CheckoutPlace { districts: CheckoutDistrict[] }
export interface CheckoutRecipient {
  recipientName: string
  phone: string
  provinceCode: string
  districtCode: string
  wardCode: string
  street: string
  note: string
}
export interface CheckoutRequest extends Omit<CheckoutRecipient, "provinceCode" | "districtCode" | "wardCode"> {
  requestId: string
  provinceCode: number
  districtCode: number
  wardCode: number
  paymentMethod: "cod"
  items: { productId: string; variantId?: string; quantity: number; expectedUnitPrice: number }[]
}
export interface CheckoutResult { _id: string; orderCode: string; totalAmount: number; orderStatus: number }

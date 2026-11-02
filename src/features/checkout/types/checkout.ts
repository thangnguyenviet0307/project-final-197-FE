export interface CheckoutPlace { code: number; name: string }
export interface CheckoutProvince extends CheckoutPlace { wards: CheckoutPlace[] }
export interface CheckoutRecipient {
  recipientName: string
  phone: string
  email: string
  provinceCode: string
  districtCode: string
  wardCode: string
  street: string
  note: string
}
export interface CheckoutRequest extends Omit<CheckoutRecipient, "provinceCode" | "districtCode" | "wardCode" | "email"> {
  requestId: string
  email?: string
  provinceCode: number
  districtCode?: number
  addressVersion?: 2
  wardCode: number
  paymentMethod: "cod"
  items: { productId: string; variantId?: string; quantity: number; expectedUnitPrice: number }[]
}
export interface CheckoutResult { _id: string; orderCode: string; totalAmount: number; orderStatus: number }

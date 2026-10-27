import type { ICustomer } from "@/features/customers/types/customers"

export function customerGender(gender: ICustomer["gender"]): string {
  return gender === "male" ? "Nam" : gender === "female" ? "Nữ" : gender === "other" ? "Khác" : "Chưa cung cấp"
}

export function customerBirthDate(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Chưa cung cấp"
  const date = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "Chưa cung cấp"
  return value.split("-").reverse().join("/")
}

export function customerAddress(customer: ICustomer): string {
  const address = customer.shippingAddress
  const parts = address ? [address.street, address.ward, address.province] : [customer.street, customer.city, customer.state]
  return parts.filter(Boolean).join(", ") || "Chưa cung cấp"
}

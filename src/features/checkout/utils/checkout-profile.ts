import type { User } from "@/features/auth/types/auth"
import type { CheckoutProvince, CheckoutRecipient } from "@/features/checkout/types/checkout"

function normalizePlaceName(value: string | undefined): string {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().trim().replace(/^(?:tinh|thanh pho|tp|phuong|xa|thi tran)(?:\s+|\.\s*)/, "")
    .replace(/\s+/g, " ")
}

export function checkoutValuesFromProfile(customer: User | null, locations: CheckoutProvince[] = []): CheckoutRecipient {
  const address = customer?.shippingAddress
  const provinces = locations.filter(item => address?.addressVersion === 2 && address.provinceCode ? item.code === address.provinceCode : normalizePlaceName(item.name) === normalizePlaceName(address?.province ?? customer?.address?.state))
  const province = provinces.length === 1 ? provinces[0] : undefined
  const currentMatches = province?.wards?.filter(ward => address?.addressVersion === 2 && address.wardCode ? ward.code === address.wardCode : normalizePlaceName(ward.name) === normalizePlaceName(address?.ward ?? customer?.address?.city)) ?? []
  const currentWard = currentMatches.length === 1 ? currentMatches[0] : undefined
  return {
    recipientName: address?.recipientName || (customer ? `${customer.lastName} ${customer.firstName}`.trim() || customer.name : ""),
    phone: customer?.phone ?? "",
    email: address?.email || customer?.email || "",
    provinceCode: province ? String(province.code) : "",
    districtCode: "",
    wardCode: currentWard ? String(currentWard.code) : "",
    street: address?.street ?? customer?.address?.street ?? "",
    note: "",
  }
}

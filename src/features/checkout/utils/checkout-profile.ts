import type { User } from "@/features/auth/types/auth"
import type { CheckoutProvince, CheckoutRecipient } from "@/features/checkout/types/checkout"

function normalizePlaceName(value: string | undefined): string {
  return (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().trim().replace(/^(?:tinh|thanh pho|tp|phuong|xa|thi tran)(?:\s+|\.\s*)/, "")
    .replace(/\s+/g, " ")
}

export function checkoutValuesFromProfile(customer: User | null, locations: CheckoutProvince[] = []): CheckoutRecipient {
  const address = customer?.shippingAddress
  const provinces = locations.filter(item => normalizePlaceName(item.name) === normalizePlaceName(address?.province ?? customer?.address?.state))
  const province = provinces.length === 1 ? provinces[0] : undefined
  const matches = province?.districts.flatMap(district => district.wards
    .filter(ward => normalizePlaceName(ward.name) === normalizePlaceName(address?.ward ?? customer?.address?.city))
    .map(ward => ({ district, ward }))) ?? []
  const districtMatches = address?.district ? matches.filter(item => item.district.name === address.district) : []
  const locality = matches.length === 1 ? matches[0] : districtMatches.length === 1 ? districtMatches[0] : undefined
  return {
    recipientName: customer ? `${customer.lastName} ${customer.firstName}`.trim() || customer.name : "",
    phone: customer?.phone ?? "",
    provinceCode: province ? String(province.code) : "",
    districtCode: locality ? String(locality.district.code) : "",
    wardCode: locality ? String(locality.ward.code) : "",
    street: address?.street ?? customer?.address?.street ?? "",
    note: "",
  }
}

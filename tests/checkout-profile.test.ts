import { expect, it } from "vitest"
import { checkoutValuesFromProfile } from "@/features/checkout/utils/checkout-profile"
import type { User } from "@/features/auth/types/auth"

const customer: User = {
  id: "buyer", name: "Nguyễn An", firstName: "An", lastName: "Nguyễn", email: "buyer@example.com", mustChangePassword: false,
  shippingAddress: { recipientName: "Nguyễn An", email: "buyer@example.com", province: " ho chi minh ", ward: "ben thanh", district: "Địa chỉ cũ", street: "12 Đường A", deliveryTime: "" },
}
const locations = [{ code: 79, name: "Thành phố Hồ Chí Minh", districts: [
  { code: 760, name: "Quận 1", wards: [{ code: 26740, name: "Phường Bến Thành" }] },
] }]

it("matches profile locality names without prefixes, accents or matching letter case and ignores stale districts", () => {
  expect(checkoutValuesFromProfile(customer, locations)).toMatchObject({ provinceCode: "79", districtCode: "760", wardCode: "26740", street: "12 Đường A" })
})

it("does not guess a ward when multiple districts have the same ward name", () => {
  const ambiguous = [{ ...locations[0], districts: [...locations[0].districts, { code: 761, name: "Quận 2", wards: [{ code: 26741, name: "Phường Bến Thành" }] }] }]
  expect(checkoutValuesFromProfile(customer, ambiguous)).toMatchObject({ provinceCode: "79", districtCode: "", wardCode: "" })
})

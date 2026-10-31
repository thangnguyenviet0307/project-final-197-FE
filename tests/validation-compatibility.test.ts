import { expect, it } from "vitest"
import { loginSchema } from "@/features/auth/schemas/auth-schemas"
import { profileSchema } from "@/features/profile/schemas/profile-schema"
import { shippingAddressSchema } from "@/features/profile/schemas/customer-account-schema"
import { heroSlideSchema } from "@/features/hero-slides/schemas/hero-slide-schema"
import { articleInputSchema } from "@/features/articles/schemas/article-schema"
import { checkoutResultSchema } from "@/features/checkout/schemas/checkout-schema"
import { savePendingCheckout } from "@/features/checkout/utils/pending-checkout"

it("retains email normalization and optional personal email with current Zod checks", () => {
  for (const schema of [loginSchema.shape.email, profileSchema.shape.personalEmail, shippingAddressSchema.shape.email]) {
    expect(schema.parse("  User@Example.com  ")).toBe("user@example.com")
    expect(schema.safeParse("not-an-email").success).toBe(false)
  }
  expect(profileSchema.shape.personalEmail.parse("")).toBe("")
})
it("retains URL trimming, HTTP restrictions and offset date-time validation", () => {
  expect(heroSlideSchema.shape.imageUrl.parse("  https://example.com/image.png  ")).toBe("https://example.com/image.png")
  expect(heroSlideSchema.shape.imageUrl.safeParse("javascript:alert(1)").success).toBe(false)
  expect(articleInputSchema.shape.publishAt.parse("2026-10-31T12:00:00+07:00")).toBe("2026-10-31T12:00:00+07:00")
  expect(articleInputSchema.shape.publishAt.safeParse("2026-10-31T12:00:00").success).toBe(false)
})
it("still rejects non-finite money and unsafe quantities after removing obsolete numeric checks", () => {
  for (const value of [Infinity, -Infinity, NaN]) expect(checkoutResultSchema.shape.totalAmount.safeParse(value).success).toBe(false)
  const request = { requestId: crypto.randomUUID(), recipientName: "Fixture", phone: "0901234567", provinceCode: 1, districtCode: 2, wardCode: 3, street: "Fixture", note: "", paymentMethod: "cod" as const, items: [{ productId: "a".repeat(24), quantity: Number.MAX_SAFE_INTEGER + 1, expectedUnitPrice: 100 }] }
  expect(() => savePendingCheckout("validation-fixture", request)).toThrow()
  expect(sessionStorage.getItem("storefront-pending-checkout-v1:validation-fixture")).toBeNull()
})

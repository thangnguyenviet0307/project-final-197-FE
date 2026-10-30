import { afterEach, expect, it } from "vitest"
import { AxiosHeaders } from "axios"
import { api } from "@/services/api"
import { createCheckout } from "@/features/checkout/services/checkout.service"
import type { CheckoutRequest } from "@/features/checkout/types/checkout"

const original = api.defaults.adapter
afterEach(() => { api.defaults.adapter = original })
it("rejects malformed confirmations instead of allowing the cart to be consumed", async () => {
  api.defaults.adapter = async config => ({ config, status: 200, statusText: "OK", headers: new AxiosHeaders(), data: { data: { totalAmount: 0 } } })
  await expect(createCheckout({} as CheckoutRequest)).rejects.toThrow()
})

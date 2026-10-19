import type { OrderItem } from "@/features/orders/types/orders"

function fraction(value: number): [bigint, bigint] {
  const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e")
  const [integer, decimals = ""] = mantissa.split(".")
  const scale = decimals.length - Number(exponent)
  const numerator = BigInt(integer + decimals)
  return scale >= 0 ? [numerator, 10n ** BigInt(scale)] : [numerator * 10n ** BigInt(-scale), 1n]
}
// Display only: match Backend half-up rounding per discounted line; never replace totalAmount.
export function orderItemSubtotal(item: Pick<OrderItem, "quantity" | "price" | "discount">): number | null {
  if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.price) || item.price < 0 || !Number.isFinite(item.discount) || item.discount < 0 || item.discount > 70) return null
  const [price, priceScale] = fraction(item.price)
  const [discount, discountScale] = fraction(item.discount)
  const numerator = BigInt(item.quantity) * price * (100n * discountScale - discount)
  const denominator = priceScale * discountScale
  const cents = (2n * numerator + denominator) / (2n * denominator)
  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) / 100 : null
}

// Matches Backend utils/order-total.ts for a single discounted unit:
// exact decimal fractions, rounded half up to two decimal places.
export function discountedPrice(price: number, discount = 0): number | null {
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(discount) || discount < 0 || discount > 70) return null
  const fraction = (value: number): [bigint, bigint] => {
    const [mantissa, exponent = "0"] = value.toString().toLowerCase().split("e")
    const [integer, decimals = ""] = mantissa.split(".")
    const scale = decimals.length - Number(exponent)
    const numerator = BigInt(integer + decimals)
    return scale >= 0 ? [numerator, 10n ** BigInt(scale)] : [numerator * 10n ** BigInt(-scale), 1n]
  }
  const [amount, amountScale] = fraction(price)
  const [percent, percentScale] = fraction(discount)
  const numerator = amount * (100n * percentScale - percent)
  const denominator = amountScale * percentScale
  const cents = (2n * numerator + denominator) / (2n * denominator)
  return cents > BigInt(Number.MAX_SAFE_INTEGER) ? null : Number(cents) / 100
}

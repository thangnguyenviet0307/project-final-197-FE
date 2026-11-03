const MAX_WARRANTY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isWarrantyRequestEligible(
  orderId: string,
  orderDate: string | null | undefined,
  existingRequestOrderIds: Iterable<string> = [],
  now = new Date()
) {
  if (!orderId || !orderDate) return false;

  const orderTime = Date.parse(orderDate);
  if (Number.isNaN(orderTime)) return false;

  const blocked = new Set(
    Array.from(existingRequestOrderIds)
      .map((value) => value?.toString?.() ?? String(value))
      .filter(Boolean)
  );

  if (blocked.has(orderId)) return false;

  return now.getTime() - orderTime <= MAX_WARRANTY_WINDOW_MS;
}

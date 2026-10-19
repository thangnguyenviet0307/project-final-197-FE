export function pageNumbers(page: number, total: number): (number | "start-gap" | "end-gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(2, Math.min(page - 1, total - 4))
  const end = Math.min(total - 1, Math.max(page + 1, 5))
  return [1, ...(start > 2 ? ["start-gap" as const] : []),
    ...Array.from({ length: end - start + 1 }, (_, index) => start + index),
    ...(end < total - 1 ? ["end-gap" as const] : []), total]
}


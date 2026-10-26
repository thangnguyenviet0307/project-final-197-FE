export function pageNumbers(page: number, total: number): (number | "start-gap" | "end-gap")[] {
  if (total <= 1) return total === 1 ? [1] : []
  const current = Math.max(1, Math.min(page, total))
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  return [1, ...(start > 2 ? ["start-gap" as const] : []),
    ...Array.from({ length: end - start + 1 }, (_, index) => start + index),
    ...(end < total - 1 ? ["end-gap" as const] : []), total]
}


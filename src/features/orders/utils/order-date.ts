export function validOrderDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
}
export function orderDateBoundary(value: string, end = false) {
  if (!validOrderDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day, end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0).toISOString()
}

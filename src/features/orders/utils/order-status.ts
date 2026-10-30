import type { Order, OrderStatus } from "@/features/orders/types/orders"

// Mirrors Backend orders.type.ts and STATUS_TRANSITIONS in orders.services.ts.
export const orderStatuses: Record<OrderStatus, string> = { 1: "Chờ xử lý", 2: "Đang xử lý", 3: "Bị từ chối", 4: "Hoàn tất" }
export const orderTransitions: Record<OrderStatus, readonly OrderStatus[]> = { 1: [2, 3], 2: [4, 3], 3: [], 4: [] }
export function isOrderStatus(value: number): value is OrderStatus { return [1, 2, 3, 4].includes(value) }
export function orderCustomer(order: Order) { return order.customerSnapshot ?? (typeof order.customerId === "object" ? order.customerId : null) }
export function personName(person: { firstName: string; lastName: string } | null | undefined) { return person ? [person.firstName, person.lastName].filter(Boolean).join(" ").trim() || "Không có thông tin" : "Không có thông tin" }
export function orderDate(value?: string) { return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString("vi-VN") : "—" }

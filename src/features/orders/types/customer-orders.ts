import type { OrderStatus } from "@/features/orders/types/orders"
import type { Pagination } from "@/types/api"

export interface CustomerOrder {
  cancelledByCustomer?: boolean
  recipientName?: string
  recipientPhone?: string
  _id: string
  orderCode?: string
  orderDate: string
  orderStatus: OrderStatus
  totalAmount: number
  street: string
  city: string
  state: string
  cancellationReason?: string
  orderItems: { productName?: string; variantName?: string | null; quantity: number; price: number; discount: number }[]
}
export interface CustomerOrdersResult { data: CustomerOrder[]; pagination: Pagination }

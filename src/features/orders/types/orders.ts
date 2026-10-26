export type OrderStatus = 1 | 2 | 3 | 4
export interface OrderPerson { _id?: string; firstName: string; lastName: string; email?: string; phone?: string }
export interface OrderItem {
  _id: string
  productId: string | { _id: string; product_name?: string } | null
  variantId?: string
  sku?: string
  productName?: string
  variantName?: string | null
  selectedOptions?: Record<string, string | number | boolean | null>
  quantity: number
  price: number
  discount: number
}
export interface Order {
  orderCode?: string
  _id: string
  customerId: string | OrderPerson | null
  customerSnapshot?: OrderPerson
  userId?: string | OrderPerson | null
  orderStatus: OrderStatus
  orderDate: string
  createdAt?: string
  requireDate?: string
  plannedShippingDate?: string
  shippingDate?: string
  street: string
  city: string
  state: string
  cancellationReason?: string
  orderNote?: string
  paymentType: number
  totalAmount: number
  orderItems: OrderItem[]
}
export interface OrdersQuery { page: number; limit: number; orderStatus?: OrderStatus; dateFrom?: string; dateTo?: string; search?: string }
export interface OrdersResult { data: Order[]; pagination: { page: number; limit: number; total: number; totalPages: number } }
export interface UpdateOrderStatusInput { orderStatus: OrderStatus; userId?: string; cancellationReason?: string }
export interface UpdateOrderDatesInput { requireDate?: string | null; plannedShippingDate?: string | null; shippingDate?: string }

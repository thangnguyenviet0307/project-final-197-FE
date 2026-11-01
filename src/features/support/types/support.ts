import type { Pagination } from "@/types/api"

export interface PolicyContent { warranty: string; returns: string; shipping: string; payment: string; support: string }
export interface PublicPolicy { content: PolicyContent; publishedAt: string | null }
export interface AdminPolicy { content: PolicyContent; publishedAt: string | null; __v: number }
export type WarrantyStatus = "submitted" | "reviewing" | "repairing" | "resolved" | "rejected"
export interface WarrantySummary {
  _id: string; orderCode: string; productName: string; variantName: string; status: WarrantyStatus; createdAt: string
  customerName?: string; handlerId?: string | null
}
export interface WarrantyDetail extends WarrantySummary {
  __v: number; description: string; updatedAt: string; customerEmail?: string; customerPhone?: string
  images: { _id: string; url: string }[]
  history: { status: WarrantyStatus; note: string; actorName: string; createdAt: string }[]
}
export interface EligibleOrder {
  _id: string; orderCode: string; orderDate: string
  items: { itemIndex: number; productName: string; variantName: string; quantity: number }[]
}
export interface SupportList<T> { data: T[]; pagination: Pagination }
export interface CreateWarrantyInput { requestId: string; orderId: string; itemIndex: number; description: string }
export interface UpdateWarrantyInput { expectedVersion: number; status: WarrantyStatus; note: string }

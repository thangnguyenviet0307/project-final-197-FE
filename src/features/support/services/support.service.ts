import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  AdminPolicy,
  CreateWarrantyInput,
  EligibleOrder,
  PolicyContent,
  PublicPolicy,
  SupportList,
  UpdateWarrantyInput,
  WarrantyDetail,
  WarrantyStatus,
  WarrantySummary,
} from '@/features/support/types/support';

export async function getPolicy(admin: boolean, signal?: AbortSignal) {
  const { data } = await api.get<
    ApiResponse<AdminPolicy | PublicPolicy | null>
  >(`/support/${admin ? 'admin/' : ''}policy`, { signal });
  return data.data;
}
export async function getAdminPolicy(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<AdminPolicy>>(
    '/support/admin/policy',
    { signal }
  );
  return data.data;
}
export async function savePolicy(input: {
  content: PolicyContent;
  publish: boolean;
  expectedVersion: number;
}) {
  const { data } = await api.put<ApiResponse<AdminPolicy>>(
    '/support/admin/policy',
    input
  );
  return data.data;
}
export async function eligibleOrders(page: number, signal?: AbortSignal, orderId?: string) {
  const { data } = await api.get<SupportList<EligibleOrder>>(
    '/support/customer/eligible-orders',
    { params: { page, limit: 10, ...(orderId ? { orderId } : {}) }, signal }
  );
  return data;
}
export async function listWarranties(
  admin: boolean,
  page: number,
  status: WarrantyStatus | '',
  signal?: AbortSignal
) {
  const { data } = await api.get<SupportList<WarrantySummary>>(
    `/support/${admin ? 'admin' : 'customer'}/requests`,
    { params: { page, limit: 10, ...(status ? { status } : {}) }, signal }
  );
  return data;
}
export async function getWarranty(
  admin: boolean,
  id: string,
  signal?: AbortSignal
) {
  const { data } = await api.get<ApiResponse<WarrantyDetail>>(
    `/support/${admin ? 'admin' : 'customer'}/requests/${encodeURIComponent(id)}`,
    { signal }
  );
  return data.data;
}
export async function createWarranty(input: CreateWarrantyInput) {
  const { data } = await api.post<ApiResponse<WarrantyDetail>>(
    '/support/customer/requests',
    input
  );
  return data.data;
}
export async function updateWarranty({
  id,
  ...input
}: UpdateWarrantyInput & { id: string }) {
  const { data } = await api.patch<ApiResponse<WarrantyDetail>>(
    `/support/admin/requests/${encodeURIComponent(id)}`,
    input
  );
  return data.data;
}
export async function uploadWarrantyImage({
  id,
  file,
}: {
  id: string;
  file: File;
}) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post<ApiResponse<WarrantyDetail>>(
    `/support/customer/requests/${encodeURIComponent(id)}/images`,
    form,
    { timeout: 60000 }
  );
  return data.data;
}

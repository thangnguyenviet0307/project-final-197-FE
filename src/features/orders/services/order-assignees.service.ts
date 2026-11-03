import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  OrderAssignee,
  OrderAssigneesResult,
} from '@/features/orders/types/order-assignee';

export async function getOrderAssignees(
  page: number,
  search: string,
  signal?: AbortSignal
): Promise<OrderAssigneesResult> {
  const { data } = await api.get<
    ApiResponse<OrderAssignee[]> & Pick<OrderAssigneesResult, 'pagination'>
  >('/orders/assignees', {
    params: {
      page,
      limit: 10,
      ...(search.trim() ? { search: search.trim() } : {}),
    },
    signal,
  });
  return { data: data.data, pagination: data.pagination };
}

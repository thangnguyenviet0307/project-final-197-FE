import { useQuery } from '@tanstack/react-query';
import { getOrderAssignees } from '@/features/orders/services/order-assignees.service';
import { useAuthStore } from '@/stores/auth.store';

export function useOrderAssignees(page: number, search: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ['orders', 'assignees', user?.id, user?.role, page, search],
    queryFn: ({ signal }) => getOrderAssignees(page, search, signal),
    enabled: user?.role === 'admin' || user?.role === 'super_admin',
  });
}

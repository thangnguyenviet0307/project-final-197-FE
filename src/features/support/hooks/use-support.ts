import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from '@/features/support/services/support.service';
import type { WarrantyStatus } from '@/features/support/types/support';

export function usePolicy() {
  return useQuery({
    queryKey: ['support', 'policy', 'public'],
    queryFn: ({ signal }) => service.getPolicy(false, signal),
  });
}
export function useAdminPolicy() {
  return useQuery({
    queryKey: ['support', 'policy', 'admin'],
    queryFn: ({ signal }) => service.getAdminPolicy(signal),
  });
}
export function useEligibleWarrantyOrders(page: number, orderId?: string) {
  return useQuery({
    queryKey: ['support', 'eligible-orders', page, orderId ?? ''],
    queryFn: ({ signal }) => service.eligibleOrders(page, signal, orderId),
  });
}
export function useWarranties(
  admin: boolean,
  page: number,
  status: WarrantyStatus | '',
  limit = 10
) {
  return useQuery({
    queryKey: [
      'support',
      'requests',
      admin ? 'admin' : 'customer',
      page,
      status,
      limit,
    ],
    queryFn: ({ signal }) =>
      service.listWarranties(admin, page, status, signal, limit),
  });
}
export function useWarranty(admin: boolean, id: string) {
  return useQuery({
    queryKey: ['support', 'request', admin ? 'admin' : 'customer', id],
    queryFn: ({ signal }) => service.getWarranty(admin, id, signal),
    enabled: /^[a-fA-F0-9]{24}$/.test(id),
  });
}
export function useSupportMutations() {
  const client = useQueryClient();
  const onSuccess = () => client.invalidateQueries({ queryKey: ['support'] });
  const meta = { suppressGlobalErrorToast: true };
  return {
    savePolicy: useMutation({
      mutationFn: service.savePolicy,
      onSuccess,
      meta,
    }),
    create: useMutation({
      mutationFn: service.createWarranty,
      onSuccess,
      meta,
    }),
    update: useMutation({
      mutationFn: service.updateWarranty,
      onSuccess,
      meta,
    }),
    upload: useMutation({
      mutationFn: service.uploadWarrantyImage,
      onSuccess,
      meta,
    }),
  };
}

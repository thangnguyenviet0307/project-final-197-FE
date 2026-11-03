import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from '@/features/support/services/information.service';

export function useInformation(slug: string) {
  return useQuery({
    queryKey: ['support', 'pages', 'public', slug],
    queryFn: ({ signal }) => service.getInformation(slug, signal),
    enabled: !!slug,
  });
}
export function useAdminInformation(slug: string) {
  return useQuery({
    queryKey: ['support', 'pages', 'admin', slug],
    queryFn: ({ signal }) => service.getAdminInformation(slug, signal),
    enabled: !!slug,
  });
}
export function useSaveInformation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: service.saveInformation,
    onSuccess: () => client.invalidateQueries({ queryKey: ['support'] }),
    meta: { suppressGlobalErrorToast: true },
  });
}

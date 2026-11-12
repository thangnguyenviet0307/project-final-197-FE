import { useQuery } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
export function useAiSearch(
  params: Record<string, string | number | undefined>
) {
  return useQuery({
    queryKey: ['ai', 'search', params],
    queryFn: ({ signal }) => aiService.search(params, signal),
    enabled: !!params['q'],
    meta: { suppressGlobalErrorToast: true },
  });
}

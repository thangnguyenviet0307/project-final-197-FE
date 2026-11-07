import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/ai.service';
export function useAiAdmin() {
  const client = useQueryClient();
  const status = useQuery({
    queryKey: ['ai', 'admin'],
    queryFn: aiService.status,
  });
  const reindex = useMutation({
    mutationFn: aiService.reindex,
    onSuccess: () => client.invalidateQueries({ queryKey: ['ai', 'admin'] }),
  });
  return { status, reindex };
}

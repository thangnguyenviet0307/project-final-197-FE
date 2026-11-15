import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAdminRecordsService } from '../services/ai-admin-records.service';
import type { AiRecordKind } from '../types/ai-admin-records';
export function useAiAdminRecords(kind: AiRecordKind, page: number) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['ai', 'admin', 'records', kind, page],
    queryFn: () => aiAdminRecordsService.read(kind, page),
    refetchInterval: 15000,
  });
  const remove = useMutation({
    mutationFn: ({ id, version }: { id: string; version: string | number }) =>
      aiAdminRecordsService.remove(kind, id, version),
    meta: { successMessage: 'Đã xóa bản ghi khỏi danh sách quản trị.' },
    onSettled: () => client.invalidateQueries({ queryKey: ['ai', 'admin'] }),
  });
  return { query, remove };
}

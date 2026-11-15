import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type { AiAdminRecords, AiRecordKind } from '../types/ai-admin-records';
export const aiAdminRecordsService = {
  async read(kind: AiRecordKind, page: number) {
    return (
      await api.get<ApiResponse<AiAdminRecords>>(`/ai/admin/records/${kind}`, {
        params: { page, limit: 10 },
      })
    ).data.data;
  },
  async remove(kind: AiRecordKind, id: string, version: string | number) {
    await api.delete(`/ai/admin/records/${kind}/${encodeURIComponent(id)}`, {
      data: { confirm: true, version },
    });
  },
};

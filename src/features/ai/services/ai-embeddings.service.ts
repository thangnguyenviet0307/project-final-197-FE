import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  EmbeddingVersionInput,
  EmbeddingVersionsData,
} from '../types/ai-embeddings';
export const aiEmbeddingsService = {
  async read() {
    return (
      await api.get<ApiResponse<EmbeddingVersionsData>>('/ai/admin/embeddings')
    ).data.data;
  },
  async create(input: EmbeddingVersionInput) {
    return (
      await api.post<ApiResponse<EmbeddingVersionsData>>(
        '/ai/admin/embeddings',
        input
      )
    ).data.data;
  },
  async activate(generationId: string | null, revision: number) {
    return (
      await api.post<ApiResponse<EmbeddingVersionsData>>(
        '/ai/admin/embeddings/activate',
        { generationId, revision }
      )
    ).data.data;
  },
  async change(
    id: string,
    revision: number,
    action: 'retry' | 'cancel' | 'delete'
  ) {
    const path = `/ai/admin/embeddings/${encodeURIComponent(id)}`;
    return (
      action === 'delete'
        ? await api.delete<ApiResponse<EmbeddingVersionsData>>(path, {
            data: { revision },
          })
        : await api.post<ApiResponse<EmbeddingVersionsData>>(
            `${path}/${action}`,
            { revision }
          )
    ).data.data;
  },
};

import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';

export async function uploadEditorImage(file: File, signal?: AbortSignal) {
  const body = new FormData();
  body.append('image', file);
  const response = await api.post<
    ApiResponse<{ url: string; publicId: string }>
  >('/editor/images', body, { signal, timeout: 60000 });
  return response.data.data;
}

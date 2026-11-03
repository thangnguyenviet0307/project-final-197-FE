import { api } from '@/services/api';
import type { ApiResponse } from '@/types/api';
import type {
  ManagedDocument,
  PublicDocument,
} from '@/features/support/types/managed-document';

export async function listDocuments(signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<ManagedDocument[]>>(
    '/support/admin/documents',
    { signal }
  );
  return data.data;
}
export async function getDocument(key: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<ManagedDocument>>(
    `/support/admin/documents/${encodeURIComponent(key)}`,
    { signal }
  );
  return data.data;
}
export async function getPublicDocument(key: string, signal?: AbortSignal) {
  const { data } = await api.get<ApiResponse<PublicDocument | null>>(
    `/support/documents/${encodeURIComponent(key)}`,
    { signal }
  );
  return data.data;
}
export async function saveDocument({
  key,
  ...input
}: {
  key: string;
  content: string;
  expectedVersion: number;
  publish: boolean;
}) {
  const { data } = await api.put<ApiResponse<ManagedDocument>>(
    `/support/admin/documents/${encodeURIComponent(key)}`,
    input
  );
  return data.data;
}
export async function deleteDocument({
  key,
  expectedVersion,
}: {
  key: string;
  expectedVersion: number;
}) {
  await api.delete(`/support/admin/documents/${encodeURIComponent(key)}`, {
    data: { expectedVersion },
  });
}
export async function recordDocumentView(key: string) {
  const { data } = await api.post<ApiResponse<{ views: number }>>(
    `/support/documents/${encodeURIComponent(key)}/views`
  );
  return data.data;
}

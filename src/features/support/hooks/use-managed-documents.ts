import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as service from '@/features/support/services/managed-document.service';
import type { PublicDocument } from '@/features/support/types/managed-document';

export function useManagedDocuments() {
  return useQuery({
    queryKey: ['support', 'documents', 'admin'],
    queryFn: ({ signal }) => service.listDocuments(signal),
  });
}
export function useManagedDocument(key: string) {
  return useQuery({
    queryKey: ['support', 'documents', 'admin', key],
    queryFn: ({ signal }) => service.getDocument(key, signal),
    enabled: !!key,
  });
}
export function usePublicDocument(key: string) {
  return useQuery({
    queryKey: ['support', 'documents', 'public', key],
    queryFn: ({ signal }) => service.getPublicDocument(key, signal),
    enabled: !!key,
  });
}
export function useDocumentMutations() {
  const client = useQueryClient();
  const onSuccess = () => client.invalidateQueries({ queryKey: ['support'] });
  const meta = { suppressGlobalErrorToast: true };
  return {
    save: useMutation({ mutationFn: service.saveDocument, onSuccess, meta }),
    remove: useMutation({
      mutationFn: service.deleteDocument,
      onSuccess,
      meta,
    }),
  };
}
export function useDocumentView(
  key: string,
  enabled: boolean,
  visitKey: string
) {
  const recorded = useRef<string | null>(null);
  const client = useQueryClient();
  useEffect(() => {
    const visit = `${visitKey}:${key}`;
    if (!enabled || recorded.current === visit) return;
    recorded.current = visit;
    void service
      .recordDocumentView(key)
      .then((result) => {
        client.setQueryData<PublicDocument | null>(
          ['support', 'documents', 'public', key],
          (previous) =>
            previous ? { ...previous, views: result.views } : previous
        );
      })
      .catch(() => undefined);
  }, [key, enabled, visitKey, client]);
}

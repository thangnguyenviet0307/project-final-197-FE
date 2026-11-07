import { api } from '@/services/api';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiResponse } from '@/types/api';
import type {
  AiAdminStatus,
  AiConversation,
  AiHistory,
  AiProduct,
  AiSearchResult,
} from '../types/ai';
const AI_HTTP_TIMEOUT_MS = 75000;
let sessionReadyUntil = 0;
let sessionIdentity = '';
let initialization: Promise<void> | null = null;
export async function ensureAiSession(force = false) {
  const identity = useAuthStore.getState().sessionId || 'guest';
  if (identity !== sessionIdentity) {
    sessionReadyUntil = 0;
    sessionIdentity = identity;
  }
  if (!force && sessionReadyUntil > Date.now()) return;
  if (initialization) return initialization;
  const initialize = async () => {
    await api.post('/ai/session', {});
  };
  const work =
    typeof navigator !== 'undefined' && navigator.locks
      ? navigator.locks.request('storefront-ai-session', initialize)
      : initialize();
  initialization = work
    .then(() => {
      if (sessionIdentity === identity) sessionReadyUntil = Date.now() + 30000;
    })
    .finally(() => {
      initialization = null;
    });
  return initialization;
}
async function waitForSession(signal?: AbortSignal, force = false) {
  signal?.throwIfAborted();
  const initialization = ensureAiSession(force);
  if (!signal) return initialization;
  return new Promise<void>((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    initialization.then(
      () => {
        signal.removeEventListener('abort', abort);
        if (signal.aborted) reject(signal.reason);
        else resolve();
      },
      (error) => {
        signal.removeEventListener('abort', abort);
        reject(error);
      }
    );
    if (signal.aborted) abort();
  });
}
async function withSession<T>(
  work: () => Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  await waitForSession(signal);
  signal?.throwIfAborted();
  try {
    return await work();
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 428)
      throw error;
    await waitForSession(signal, true);
    signal?.throwIfAborted();
    return work();
  }
}
export const aiService = {
  async list(page = 1) {
    return withSession(
      async () =>
        (
          await api.get<ApiResponse<{ rows: AiConversation[]; total: number }>>(
            '/ai/conversations',
            { params: { page } }
          )
        ).data.data
    );
  },
  async create(signal?: AbortSignal) {
    return withSession(
      async () =>
        (
          await api.post<ApiResponse<{ id: string }>>(
            '/ai/conversations',
            {},
            { signal }
          )
        ).data.data,
      signal
    );
  },
  async history(id: string, page = 1) {
    return withSession(
      async () =>
        (
          await api.get<ApiResponse<AiHistory>>(
            `/ai/conversations/${id}/messages`,
            { params: { page } }
          )
        ).data.data
    );
  },
  async end(id: string) {
    await withSession(() => api.post(`/ai/conversations/${id}/end`, {}));
  },
  async ticket(signal?: AbortSignal) {
    return withSession(
      async () =>
        (
          await api.post<ApiResponse<{ ticket: string }>>(
            '/ai/socket-ticket',
            {},
            { signal }
          )
        ).data.data.ticket,
      signal
    );
  },
  async search(
    params: Record<string, string | number | undefined>,
    signal?: AbortSignal
  ) {
    return (
      await api.get<ApiResponse<AiSearchResult>>('/ai/search', {
        params,
        signal,
        timeout: AI_HTTP_TIMEOUT_MS,
      })
    ).data.data;
  },
  async recommendations(slug: string, signal?: AbortSignal) {
    return (
      await api.get<ApiResponse<AiProduct[]>>(
        `/ai/recommendations/${encodeURIComponent(slug)}`,
        { signal, timeout: AI_HTTP_TIMEOUT_MS }
      )
    ).data.data;
  },
  async status() {
    return (await api.get<ApiResponse<AiAdminStatus>>('/ai/admin/status')).data
      .data;
  },
  async reindex() {
    await api.post('/ai/admin/reindex', {});
  },
};
export function socketEndpoint() {
  const url = new URL(
    (api.defaults.baseURL || '/api/v1').replace(/\/$/, '') + '/ai/socket',
    window.location.origin
  );
  return { origin: url.origin, path: url.pathname };
}

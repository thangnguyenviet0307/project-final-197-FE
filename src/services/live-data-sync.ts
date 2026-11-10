import { api, refreshAccessToken } from '@/services/api';
import { useAuthStore } from '@/stores/auth.store';
import { notifyBusinessChange } from '@/services/data-sync';

// Fetch supports bearer authentication without putting credentials in stream URLs.
export function subscribeToLiveDataChanges() {
  const version = useAuthStore.getState().sessionVersion;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let delay = 1000;
  const current = () => !controller.signal.aborted &&
    useAuthStore.getState().sessionVersion === version;

  const connect = async () => {
    try {
      let token = useAuthStore.getState().accessToken;
      if (!token || !current()) return;
      const request = () => fetch(api.getUri({ url: '/data-sync/events' }), {
        headers: { Authorization: `Bearer ${token}`, 'X-Login-Area': 'admin', Accept: 'text/event-stream' },
        credentials: 'include',
        signal: controller.signal,
      });
      let response = await request();
      if (!current()) { await response.body?.cancel(); return; }
      if (response.status === 401) {
        await response.body?.cancel();
        token = await refreshAccessToken();
        if (!current()) return;
        response = await request();
      }
      // Forbidden accounts must not repeatedly open a protected stream.
      if (response.status === 401 || response.status === 403) {
        await response.body?.cancel();
        return;
      }
      if (!response.ok || !response.headers.get('content-type')?.includes('text/event-stream') || !response.body) {
        await response.body?.cancel();
        throw new Error('Data sync unavailable');
      }
      const reader = response.body.getReader();
      const connectedAt = Date.now();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (current()) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newline).replace(/\r$/, '');
            buffer = buffer.slice(newline + 1);
            if (line === 'data: changed' && current()) {
              notifyBusinessChange();
            }
          }
          if (buffer.length > 8192) throw new Error('Invalid data sync stream');
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
        // An immediately closing stream must back off even if it sent a signal.
        if (Date.now() - connectedAt >= 30_000) delay = 1000;
      }
    } catch {
      // Temporary disconnects never clear authentication or navigate the page.
    }
    if (current()) {
      timer = setTimeout(() => { void connect(); }, delay);
      delay = Math.min(delay * 2, 30_000);
    }
  };
  void connect();
  return () => {
    controller.abort();
    if (timer !== undefined) clearTimeout(timer);
  };
}

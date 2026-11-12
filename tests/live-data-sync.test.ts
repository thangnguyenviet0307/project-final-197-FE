import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/stores/auth.store';
import { subscribeToLiveDataChanges } from '@/services/live-data-sync';
import { notifyBusinessChange } from '@/services/data-sync';
import { refreshAccessToken } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: { getUri: () => 'http://localhost:5000/api/v1/data-sync/events' },
  refreshAccessToken: vi.fn(async () => 'renewed-access'),
}));
vi.mock('@/services/data-sync', () => ({ notifyBusinessChange: vi.fn() }));
let stop: (() => void) | undefined;
beforeEach(() => {
  vi.useFakeTimers();
  useAuthStore.setState({ accessToken: 'test-access', sessionVersion: 10 });
});
afterEach(() => {
  stop?.();
  stop = undefined;
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const streamResponse = (...chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks)
          controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      },
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );

it('handles fragmented signals, ignores heartbeats and reconnects without navigation or query polling', async () => {
  const request = vi.fn(async () =>
    streamResponse(': keepalive\n\n', 'data: cha', 'nged\r\n\r\n')
  );
  vi.stubGlobal('fetch', request);
  stop = subscribeToLiveDataChanges();
  await vi.advanceTimersByTimeAsync(0);
  expect(notifyBusinessChange).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0]).toEqual(
    expect.arrayContaining([
      'http://localhost:5000/api/v1/data-sync/events',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-access',
        }),
      }),
    ])
  );
  await vi.advanceTimersByTimeAsync(1000);
  expect(request).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1999);
  expect(request).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(1);
  expect(request).toHaveBeenCalledTimes(3);
  stop();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(request).toHaveBeenCalledTimes(3);
});

it('renews expired access through the shared auth flow and sends no token in the URL', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 401 }))
    .mockResolvedValueOnce(streamResponse('data: changed\n\n'));
  vi.stubGlobal('fetch', request);
  stop = subscribeToLiveDataChanges();
  await vi.advanceTimersByTimeAsync(0);
  expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[1]?.[1].headers.Authorization).toBe(
    'Bearer renewed-access'
  );
  expect(request.mock.calls[1]?.[0]).not.toContain('renewed-access');
  expect(notifyBusinessChange).toHaveBeenCalledTimes(1);
});

it('backs off network failures without clearing the session and ignores obsolete responses', async () => {
  const request = vi.fn().mockRejectedValue(new Error('Offline'));
  vi.stubGlobal('fetch', request);
  stop = subscribeToLiveDataChanges();
  await vi.advanceTimersByTimeAsync(0);
  await vi.advanceTimersByTimeAsync(1000);
  expect(request).toHaveBeenCalledTimes(2);
  expect(useAuthStore.getState().accessToken).toBe('test-access');
  useAuthStore.setState({ sessionVersion: 11 });
  await vi.advanceTimersByTimeAsync(30_000);
  expect(request).toHaveBeenCalledTimes(2);
  expect(notifyBusinessChange).not.toHaveBeenCalled();
});

import { beforeEach, expect, it, vi } from 'vitest';
const requests = vi.hoisted(() => ({ post: vi.fn(), get: vi.fn() }));
vi.mock('@/services/api', () => ({
  api: { ...requests, defaults: { baseURL: 'http://localhost:5000/api/v1' } },
}));
import { aiService } from '@/features/ai/services/ai.service';
import { useAuthStore } from '@/stores/auth.store';
beforeEach(() => {
  requests.post.mockReset();
  requests.get.mockReset();
  useAuthStore.setState({ sessionId: crypto.randomUUID() });
});
it('serializes initialization before concurrent private calls and keeps public requests session-free', async () => {
  let release!: () => void;
  const initialized = new Promise<void>((resolve) => {
    release = resolve;
  });
  requests.post.mockImplementation(async (path: string) => {
    if (path === '/ai/session') {
      await initialized;
      return { data: { data: null } };
    }
    if (path === '/ai/socket-ticket')
      return { data: { data: { ticket: 'one-use' } } };
    return { data: { data: { id: 'conversation' } } };
  });
  requests.get.mockResolvedValue({ data: { data: { rows: [], total: 0 } } });
  const created = aiService.create();
  const list = aiService.list();
  const ticket = aiService.ticket();
  await Promise.resolve();
  expect(
    requests.post.mock.calls.filter((c) => c[0] === '/ai/session')
  ).toHaveLength(1);
  expect(requests.get).not.toHaveBeenCalled();
  release();
  await Promise.all([created, list, ticket]);
  expect(
    requests.post.mock.calls.filter((c) => c[0] === '/ai/session')
  ).toHaveLength(1);
  const count = requests.post.mock.calls.length;
  const controller = new AbortController();
  await aiService.search({ q: 'phone' }, controller.signal);
  expect(requests.post).toHaveBeenCalledTimes(count);
  expect(requests.get).toHaveBeenLastCalledWith(
    '/ai/search',
    expect.objectContaining({ timeout: 75000, signal: controller.signal })
  );
});

it('accepts only terminal cancellation confirmations for the matching request', async () => {
  const result = { requestId: 'matching-request', status: 'cancelled', answer: '', sources: [] };
  requests.post.mockResolvedValue({ data: { data: result } });
  await expect(aiService.cancel('conversation', result.requestId, 'question')).resolves.toEqual(result);
  expect(requests.post).toHaveBeenLastCalledWith('/ai/conversations/conversation/cancel', { requestId: result.requestId, content: 'question' });
  requests.post.mockResolvedValue({ data: { data: { ...result, status: 'processing' } } });
  await expect(aiService.cancel('conversation', result.requestId, 'question')).rejects.toThrow();
  requests.post.mockResolvedValue({ data: { data: { ...result, requestId: 'other-request' } } });
  await expect(aiService.cancel('conversation', result.requestId, 'question')).rejects.toThrow('mismatch');
});
it('cancelling one preparation does not abort shared initialization or the other caller', async () => {
  let release!: () => void;
  const initialized = new Promise<void>((resolve) => {
    release = resolve;
  });
  requests.post.mockImplementation(async (path: string) => {
    if (path === '/ai/session') {
      await initialized;
      return { data: { data: null } };
    }
    return { data: { data: { ticket: 'valid' } } };
  });
  const controller = new AbortController();
  const cancelled = aiService.create(controller.signal);
  const expected = expect(cancelled).rejects.toMatchObject({
    name: 'AbortError',
  });
  const surviving = aiService.ticket();
  controller.abort();
  await expected;
  release();
  await expect(surviving).resolves.toBe('valid');
  expect(
    requests.post.mock.calls.filter((c) => c[0] === '/ai/conversations')
  ).toHaveLength(0);
  expect(
    requests.post.mock.calls.filter((c) => c[0] === '/ai/session')
  ).toHaveLength(1);
});

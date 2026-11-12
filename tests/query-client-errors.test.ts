import { afterEach, expect, it, vi } from 'vitest';
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));
vi.mock('sonner', () => ({ toast }));
import { queryClient } from '@/services/query-client';

afterEach(() => {
  queryClient.clear();
  vi.clearAllMocks();
});

it('keeps errors inline for queries that explicitly suppress the global toast', async () => {
  await expect(
    queryClient.fetchQuery({
      queryKey: ['ai', 'guest', 'conversations'],
      queryFn: async () => {
        throw new Error('Cannot load chat');
      },
      meta: { suppressGlobalErrorToast: true },
    })
  ).rejects.toThrow('Cannot load chat');
  expect(toast.error).not.toHaveBeenCalled();
});

it('preserves global notifications for other queries', async () => {
  await expect(
    queryClient.fetchQuery({
      queryKey: ['products'],
      queryFn: async () => {
        throw new Error('Cannot load products');
      },
    })
  ).rejects.toThrow('Cannot load products');
  expect(toast.error).toHaveBeenCalledTimes(1);
});

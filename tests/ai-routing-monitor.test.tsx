import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiRoutingMonitor } from '@/features/ai/components/ai-routing-monitor';
import { aiRoutingService } from '@/features/ai/services/ai-routing.service';
let client: QueryClient;
beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});
it('shows the actual model and the quota fallback chain for administrative monitoring', async () => {
  vi.spyOn(aiRoutingService, 'read').mockResolvedValue({
    sampledAt: '2026-11-15T00:00:00Z',
    runs: [
      {
        _id: 'run',
        stage: 'answer',
        status: 'running',
        createdAt: '2026-11-15T00:00:00Z',
        updatedAt: '2026-11-15T00:00:01Z',
        attempts: [
          {
            provider: 'gemini',
            model: 'gemini-test',
            status: 'quota',
            startedAt: '2026-11-15T00:00:00Z',
            finishedAt: '2026-11-15T00:00:01Z',
          },
          {
            provider: 'groq',
            model: 'llama-test',
            status: 'running',
            startedAt: '2026-11-15T00:00:01Z',
          },
        ],
      },
    ],
  });
  render(
    <QueryClientProvider client={client}>
      <AiRoutingMonitor />
    </QueryClientProvider>
  );
  expect(await screen.findByText('llama-test')).toBeTruthy();
  expect(screen.getByText(/gemini-test — Giới hạn quota/)).toBeTruthy();
  expect(screen.getByText('Đang xử lý trong danh sách: 1')).toBeTruthy();
});
it('shows an empty state when no provider operations have run', async () => {
  vi.spyOn(aiRoutingService, 'read').mockResolvedValue({
    sampledAt: '2026-11-15T00:00:00Z',
    runs: [],
  });
  render(
    <QueryClientProvider client={client}>
      <AiRoutingMonitor />
    </QueryClientProvider>
  );
  expect(
    await screen.findByText('Chưa có hoạt động model được ghi nhận.')
  ).toBeTruthy();
});

it('renders one activation row and one model timeline entry for its JSON and streaming phases', async () => {
  vi.spyOn(aiRoutingService, 'read').mockResolvedValue({
    sampledAt: '2026-11-15T00:00:02Z',
    runs: [
      {
        _id: 'activation-one',
        kind: 'activation',
        stage: 'answer',
        status: 'completed',
        createdAt: '2026-11-15T00:00:00Z',
        updatedAt: '2026-11-15T00:00:02Z',
        attempts: [
          {
            phase: 'intent',
            provider: 'gemini',
            model: 'gemini-one',
            status: 'completed',
            startedAt: '2026-11-15T00:00:00Z',
            finishedAt: '2026-11-15T00:00:01Z',
          },
          {
            phase: 'answer',
            provider: 'gemini',
            model: 'gemini-one',
            status: 'completed',
            startedAt: '2026-11-15T00:00:01Z',
            finishedAt: '2026-11-15T00:00:02Z',
          },
        ],
      },
    ],
  });
  render(
    <QueryClientProvider client={client}>
      <AiRoutingMonitor />
    </QueryClientProvider>
  );
  expect(await screen.findByText('Kiểm tra kết nối AI')).toBeTruthy();
  expect(screen.getAllByRole('row')).toHaveLength(2);
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.getByText('Đang xử lý trong danh sách: 0')).toBeTruthy();
});

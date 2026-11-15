import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiAdminRecordsSection } from '@/features/ai/components/ai-admin-records';
import { aiAdminRecordsService } from '@/features/ai/services/ai-admin-records.service';
import type { AiRecordKind } from '@/features/ai/types/ai-admin-records';

let client: QueryClient;
beforeEach(() => {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  vi.spyOn(aiAdminRecordsService, 'read').mockImplementation(
    async (_kind, page) => ({
      rows: [
        {
          _id: `record-${page}`,
          updatedAt: '2026-11-15T00:00:00.000Z',
          createdAt: '2026-11-15T00:00:00.000Z',
          count: page,
          event: `event-${page}`,
          reason: 'fixture',
          score: 60,
          error: { code: `error-${page}`, stage: 'answer', message: 'fixture' },
        },
      ],
      page,
      total: 21,
      limit: 10,
    })
  );
  vi.spyOn(aiAdminRecordsService, 'remove').mockResolvedValue();
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});
function mount(kind: AiRecordKind, canManage = false) {
  render(
    <QueryClientProvider client={client}>
      <AiAdminRecordsSection kind={kind} canManage={canManage} />
    </QueryClientProvider>
  );
}
it.each(['failures', 'usage', 'risks'] as const)(
  'paginates %s using shared admin controls without exposing deletion to viewers',
  async (kind) => {
    mount(kind);
    await screen.findByText('Trang 1 / 3');
    expect(screen.queryByRole('button', { name: /^Xóa bản ghi/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    await screen.findByText('Trang 2 / 3');
    expect(aiAdminRecordsService.read).toHaveBeenCalledWith(kind, 2);
  }
);
it('requires shared confirmation and deletes the selected snapshot only for Super Admin', async () => {
  mount('failures', true);
  fireEvent.click(await screen.findByRole('button', { name: /^Xóa bản ghi/ }));
  await screen.findByRole('alertdialog');
  expect(aiAdminRecordsService.remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  expect(aiAdminRecordsService.remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /^Xóa bản ghi/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa' }));
  await waitFor(() =>
    expect(aiAdminRecordsService.remove).toHaveBeenCalledExactlyOnceWith(
      'failures',
      'record-1',
      '2026-11-15T00:00:00.000Z'
    )
  );
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
});
it('retains the dialog when a stale record cannot be deleted', async () => {
  vi.mocked(aiAdminRecordsService.remove).mockRejectedValue(new Error('stale'));
  mount('risks', true);
  fireEvent.click(await screen.findByRole('button', { name: /^Xóa bản ghi/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa' }));
  await waitFor(() =>
    expect(aiAdminRecordsService.remove).toHaveBeenCalledOnce()
  );
  expect(screen.getByRole('alertdialog')).toBeTruthy();
});

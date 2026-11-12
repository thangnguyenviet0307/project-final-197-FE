import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiEmbeddingVersions } from '@/features/ai/components/ai-embedding-versions';
import { aiEmbeddingsService } from '@/features/ai/services/ai-embeddings.service';
import type { EmbeddingVersionsData } from '@/features/ai/types/ai-embeddings';
const id = '6c90df97-2427-4ef9-9fe0-61d04c68dd73';
let data: EmbeddingVersionsData, client: QueryClient;
beforeEach(() => {
  data = {
    revision: 3,
    activeId: null,
    collection: 'ai_embedding_chunks',
    versions: [
      {
        _id: id,
        connectionId: 'openai-id',
        provider: 'openai',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        indexName: 'ai_vectors_test',
        state: 'verifying',
        chunks: 10,
        verified: 6,
        createdAt: '2026-11-12T00:00:00.000Z',
        autoActivate: false,
        indexDefinition: {},
      },
    ],
  };
  vi.spyOn(aiEmbeddingsService, 'read').mockImplementation(async () => data);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});
function mount() {
  render(
    <QueryClientProvider client={client}>
      <AiEmbeddingVersions
        canManage
        encryptionReady
        connections={[
          {
            id: 'openai-id',
            name: 'OpenAI embeddings',
            provider: 'openai',
            model: 'gpt-4.1-mini',
            keyHint: '1234',
            checkedOk: true,
          },
        ]}
      />
    </QueryClientProvider>
  );
}

it('explains when queued embeddings have no running server worker', async () => {
  data.worker = {
    running: false,
    lastTickAt: null,
    lastErrorCode: null,
    enabled: true,
    indexingEnabled: true,
    emergencyDisabled: false,
  };
  mount();
  expect(await screen.findByText(/Worker đồng bộ chưa chạy/)).toBeTruthy();
});

it('shows real progress and blocks activation until the index is verified', async () => {
  mount();
  expect(await screen.findByText('6 / 10')).toBeTruthy();
  expect(
    (
      screen.getByRole('button', {
        name: 'Dùng phiên bản này',
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
  expect(screen.getByText('Đang xác nhận index')).toBeTruthy();
});
it('requires confirmation before switching back to a ready version', async () => {
  data.versions[0]!.state = 'ready';
  const activate = vi
    .spyOn(aiEmbeddingsService, 'activate')
    .mockImplementation(async () => {
      data = { ...data, activeId: id, revision: 4 };
      return data;
    });
  mount();
  fireEvent.click(
    await screen.findByRole('button', { name: 'Dùng phiên bản này' })
  );
  expect(activate).not.toHaveBeenCalled();
  expect(screen.getByText(/giữ lại để quay về/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận phiên bản' }));
  await waitFor(() => expect(activate).toHaveBeenCalledWith(id, 3));
  expect(await screen.findByText('Đang sử dụng')).toBeTruthy();
});
it('creates a separate OpenAI embedding version without changing chat configuration', async () => {
  const create = vi
    .spyOn(aiEmbeddingsService, 'create')
    .mockResolvedValue({ ...data, revision: 4 });
  mount();
  await screen.findByText('6 / 10');
  fireEvent.click(
    await screen.findByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  expect(screen.getByText(/không ghi đè index hiện tại/)).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Số chiều vector'), {
    target: { value: '768' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Xếp lịch đồng bộ phiên bản' })
  );
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith({
      revision: 3,
      connectionId: 'openai-id',
      model: 'text-embedding-3-small',
      dimensions: 768,
      engine: 'exact',
      startSync: true,
    })
  );
});
it('deletes only through explicit inline confirmation', async () => {
  data.versions[0]!.state = 'failed';
  const remove = vi
    .spyOn(aiEmbeddingsService, 'change')
    .mockImplementation(async () => {
      data = { ...data, revision: 4, versions: [] };
      return data;
    });
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa phiên bản' }));
  expect(remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận phiên bản' }));
  await waitFor(() => expect(remove).toHaveBeenCalledWith(id, 3, 'delete'));
  expect(await screen.findByText('Chưa có phiên bản embeddings.')).toBeTruthy();
});

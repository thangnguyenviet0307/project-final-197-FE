import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
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
    supportedModels: [
      {
        provider: 'gemini',
        model: 'gemini-embedding-001',
        dimensions: [768, 1536, 3072],
        available: true,
      },
      {
        provider: 'gemini',
        model: 'gemini-embedding-2',
        dimensions: [768, 1536, 3072],
        available: true,
      },
    ],
    versions: [
      {
        _id: id,
        connectionId: 'gemini-id',
        provider: 'gemini',
        model: 'gemini-embedding-001',
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
            id: 'gemini-id',
            name: 'Gemini (.env)',
            provider: 'gemini',
            model: 'gemini-3.1-flash-lite',
            keyHint: '1234',
            checkedOk: true,
          },
        ]}
      />
    </QueryClientProvider>
  );
}

it('paginates versions while retaining the active model name outside the displayed page', async () => {
  const original = data.versions[0]!;
  data.versions = Array.from({ length: 12 }, (_, index) => ({
    ...original,
    _id: `version-${index}`,
    model: `embedding-${index}`,
  }));
  data.activeId = 'version-11';
  mount();
  await screen.findByText('Trang 1 / 2');
  expect(screen.getByText('Phiên bản đang dùng: embedding-11')).toBeTruthy();
  expect(screen.queryByText('embedding-10')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
  await screen.findByText('Trang 2 / 2');
  expect(screen.getByText('embedding-10')).toBeTruthy();
  expect(screen.queryByText('embedding-0')).toBeNull();
});

it('defaults new versions to the recommended available embedding model', async () => {
  data.supportedModels![1]!.recommended = true;
  mount();
  await screen.findByText('Trang 1 / 1');
  fireEvent.click(
    await screen.findByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  await waitFor(() =>
    expect(
      (
        screen.getByLabelText(
          'Nhà cung cấp / model embedding'
        ) as HTMLSelectElement
      ).value
    ).toBe('gemini-embedding-2')
  );
});

it('explains when queued embeddings have no running server worker', async () => {
  const infoToast = vi.spyOn(toast, 'info');
  data.worker = {
    running: false,
    lastTickAt: null,
    lastErrorCode: null,
    enabled: true,
    indexingEnabled: true,
    emergencyDisabled: false,
  };
  mount();
  await waitFor(() =>
    expect(infoToast).toHaveBeenCalledWith(
      expect.stringMatching(/Worker đồng bộ chưa chạy/),
      { id: 'ai-admin-worker-status' }
    )
  );
  expect(screen.queryByText(/Worker đồng bộ chưa chạy/)).toBeNull();
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
  const successToast = vi.spyOn(toast, 'success');
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
  expect(successToast).toHaveBeenCalledTimes(1);
});
it('creates a separate Gemini embedding version without changing chat configuration', async () => {
  const create = vi
    .spyOn(aiEmbeddingsService, 'create')
    .mockResolvedValue({ ...data, revision: 4 });
  mount();
  await screen.findByText('6 / 10');
  fireEvent.click(
    await screen.findByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  expect(screen.getByText(/không ghi đè index hiện tại/)).toBeTruthy();
  expect(
    (
      screen.getByLabelText(
        'Nhà cung cấp / model embedding'
      ) as HTMLSelectElement
    ).value
  ).toBe('gemini-embedding-001');
  fireEvent.change(screen.getByLabelText('Số chiều vector'), {
    target: { value: '768' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Xếp lịch đồng bộ phiên bản' })
  );
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith({
      revision: 3,
      connectionId: 'gemini-id',
      model: 'gemini-embedding-001',
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

it('keeps version refresh usable for viewers while all management actions are disabled', async () => {
  data.versions[0]!.state = 'ready';
  const activate = vi.spyOn(aiEmbeddingsService, 'activate');
  render(
    <QueryClientProvider client={client}>
      <AiEmbeddingVersions connections={[]} encryptionReady canManage={false} />
    </QueryClientProvider>
  );
  await screen.findByText('6 / 10');
  const refresh = screen.getByRole('button', {
    name: 'Cập nhật phiên bản',
  }) as HTMLButtonElement;
  await waitFor(() => expect(refresh.disabled).toBe(false));
  expect(
    (
      screen.getByRole('button', {
        name: 'Dùng phiên bản này',
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
  expect(
    (screen.getByRole('button', { name: 'Xóa phiên bản' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  fireEvent.click(refresh);
  await waitFor(() =>
    expect(aiEmbeddingsService.read).toHaveBeenCalledTimes(2)
  );
  expect(activate).not.toHaveBeenCalled();
});

it('refreshes embedding revisions and requires a fresh confirmation after a 409 conflict', async () => {
  const errorToast = vi.spyOn(toast, 'error');
  const change = vi
    .spyOn(aiEmbeddingsService, 'change')
    .mockImplementation(async () => {
      data = { ...data, revision: 4 };
      throw {
        isAxiosError: true,
        response: { status: 409, data: { message: 'Configuration changed' } },
      };
    });
  data.versions[0]!.state = 'failed';
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa phiên bản' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận phiên bản' }));
  await waitFor(() => expect(change).toHaveBeenCalledWith(id, 3, 'delete'));
  await waitFor(() =>
    expect(
      screen.queryByRole('group', { name: 'Xác nhận thao tác embeddings' })
    ).toBeNull()
  );
  expect(errorToast).toHaveBeenCalledTimes(1);
  expect(aiEmbeddingsService.read).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'Xóa phiên bản' }));
  expect(change).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận phiên bản' }));
  await waitFor(() => expect(change).toHaveBeenLastCalledWith(id, 4, 'delete'));
});

it('retains legacy OpenAI versions but disables unsupported activation and retries', async () => {
  data.versions[0] = {
    ...data.versions[0]!,
    provider: 'openai',
    model: 'text-embedding-3-small',
    state: 'ready',
  };
  mount();
  await screen.findByText('6 / 10');
  expect(
    (
      screen.getByRole('button', {
        name: 'Dùng phiên bản này',
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
  expect(
    (
      screen.getByRole('button', {
        name: 'Thử lại / xác nhận',
      }) as HTMLButtonElement
    ).disabled
  ).toBe(true);
  expect(
    (screen.getByRole('button', { name: 'Xóa phiên bản' }) as HTMLButtonElement)
      .disabled
  ).toBe(false);
});

it('selects a separate Cloudflare or OpenRouter embedding model with matching connection and dimensions', async () => {
  data.supportedModels!.push(
    {
      provider: 'cloudflare',
      model: '@cf/baai/bge-m3',
      dimensions: [1024],
      available: true,
    },
    {
      provider: 'openrouter',
      model: 'nvidia/nemotron-3.5-embed-1b:free',
      dimensions: [2048],
      available: true,
    }
  );
  const create = vi
    .spyOn(aiEmbeddingsService, 'create')
    .mockImplementation(async () => {
      data = { ...data, revision: data.revision + 1 };
      return data;
    });
  render(
    <QueryClientProvider client={client}>
      <AiEmbeddingVersions
        canManage
        encryptionReady
        connections={[
          {
            id: 'gemini-id',
            name: 'Gemini',
            provider: 'gemini',
            model: 'gemini-test',
            checkedOk: true,
            keyHint: '',
          },
          {
            id: 'cloudflare-id',
            name: 'Cloudflare',
            provider: 'cloudflare',
            model: '@cf/baai/bge-m3',
            checkedOk: true,
            keyHint: '',
          },
          {
            id: 'openrouter-id',
            name: 'OpenRouter',
            provider: 'openrouter',
            model: 'nvidia/nemotron-3.5-embed-1b:free',
            checkedOk: true,
            keyHint: '',
          },
        ]}
      />
    </QueryClientProvider>
  );
  fireEvent.click(
    await screen.findByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  await screen.findByText('6 / 10');
  fireEvent.click(
    screen.getByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  fireEvent.change(screen.getByLabelText('Nhà cung cấp / model embedding'), {
    target: { value: '@cf/baai/bge-m3' },
  });
  expect(
    (screen.getByLabelText('Số chiều vector') as HTMLSelectElement).value
  ).toBe('1024');
  fireEvent.click(
    screen.getByRole('button', { name: 'Xếp lịch đồng bộ phiên bản' })
  );
  await waitFor(() =>
    expect(create).toHaveBeenCalledWith({
      revision: 3,
      connectionId: 'cloudflare-id',
      model: '@cf/baai/bge-m3',
      dimensions: 1024,
      engine: 'exact',
      startSync: true,
    })
  );
  await waitFor(() =>
    expect(screen.queryByLabelText('Nhà cung cấp / model embedding')).toBeNull()
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Tạo phiên bản embeddings' })
  );
  fireEvent.change(screen.getByLabelText('Nhà cung cấp / model embedding'), {
    target: { value: 'nvidia/nemotron-3.5-embed-1b:free' },
  });
  expect(
    (screen.getByLabelText('Số chiều vector') as HTMLSelectElement).value
  ).toBe('2048');
});

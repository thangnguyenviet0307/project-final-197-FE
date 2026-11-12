import { aiEmbeddingsService } from '@/features/ai/services/ai-embeddings.service';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AiConfiguration } from '@/features/ai/components/ai-configuration';
import { aiSettingsService } from '@/features/ai/services/ai-settings.service';
import type { AiSettingsData } from '@/features/ai/types/ai-settings';

let data: AiSettingsData;
let client: QueryClient;
beforeEach(() => {
  data = {
    revision: 1,
    source: 'database',
    encryptionReady: true,
    vectorReady: false,
    emergencyDisabled: false,
    settings: {
      enabled: false,
      semanticEnabled: false,
      indexingEnabled: false,
      riskEnabled: false,
      dailyCalls: 100,
      activeConnectionId: null,
    },
    connections: [
      {
        id: '6c90df97-2427-4ef9-9fe0-61d04c68dd73',
        name: 'Gemini chính',
        provider: 'gemini',
        model: 'gemini-3.1-flash-lite',
        keyHint: '1234',
        checkedOk: false,
      },
    ],
    audit: [],
    suggestedModels: ['gemini-3.1-flash-lite'],
  };
  vi.spyOn(aiEmbeddingsService, 'read').mockResolvedValue({
    revision: 1,
    activeId: null,
    versions: [],
    collection: 'ai_embedding_chunks',
  });
  vi.spyOn(aiSettingsService, 'read').mockImplementation(async () => data);
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
      <AiConfiguration />
    </QueryClientProvider>
  );
}

it('adds a model/key through the real service contract and clears the credential input after saving', async () => {
  const save = vi
    .spyOn(aiSettingsService, 'connection')
    .mockImplementation(async () => ({ ...data, revision: 2 }));
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Thêm kết nối' }));
  fireEvent.change(screen.getByLabelText('Tên kết nối'), {
    target: { value: 'Dự phòng' },
  });
  fireEvent.change(screen.getByLabelText('API key'), {
    target: { value: 'new-secret-gemini-key' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu kết nối' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      {
        revision: 1,
        name: 'Dự phòng',
        provider: 'gemini',
        model: 'gemini-3.1-flash-lite',
        apiKey: 'new-secret-gemini-key',
      },
      undefined
    )
  );
  await waitFor(() => expect(screen.queryByLabelText('API key')).toBeNull());
  expect(document.body.textContent).not.toContain('new-secret-gemini-key');
  expect(client.getMutationCache().getAll()).toHaveLength(0);
});

it('asks before consuming test quota, then allows activation only after success', async () => {
  const test = vi.spyOn(aiSettingsService, 'test').mockResolvedValue({
    ...data,
    revision: 2,
    connections: [{ ...data.connections[0]!, checkedOk: true }],
  });
  const save = vi
    .spyOn(aiSettingsService, 'save')
    .mockResolvedValue({ ...data, revision: 3 });
  mount();
  expect(await screen.findByText('••••1234')).toBeTruthy();
  expect(
    (screen.getByRole('button', { name: 'Kích hoạt' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
  expect(test).not.toHaveBeenCalled();
  expect(screen.getByText(/tối đa 2 lượt API/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Chạy kiểm tra' }));
  await waitFor(() =>
    expect(test).toHaveBeenCalledWith(data.connections[0]!.id, 1)
  );
  await waitFor(() =>
    expect(
      (screen.getByRole('button', { name: 'Kích hoạt' }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        activeConnectionId: data.connections[0]!.id,
        enabled: true,
        revision: 2,
      })
    )
  );
});

it('deletes keys only after inline confirmation and does not use browser popups', async () => {
  const popup = vi.spyOn(window, 'confirm');
  const remove = vi
    .spyOn(aiSettingsService, 'remove')
    .mockResolvedValue({ ...data, revision: 2, connections: [] });
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Xóa' }));
  expect(remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa' }));
  await waitFor(() =>
    expect(remove).toHaveBeenCalledWith(data.connections[0]!.id, 1)
  );
  expect(popup).not.toHaveBeenCalled();
  expect(
    await screen.findByText('Chưa có kết nối được lưu trên web.')
  ).toBeTruthy();
});

it('saves feature switches and daily limits to the backend', async () => {
  const save = vi
    .spyOn(aiSettingsService, 'save')
    .mockResolvedValue({ ...data, revision: 2 });
  mount();
  await screen.findByText('Điều khiển vận hành');
  fireEvent.click(screen.getByRole('switch', { name: 'Theo dõi rủi ro' }));
  fireEvent.change(screen.getByLabelText('Giới hạn lượt gọi / ngày UTC'), {
    target: { value: '75' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu vận hành' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        riskEnabled: true,
        dailyCalls: 75,
        revision: 1,
      })
    )
  );
});

it('prevents writing credentials when the server wrapping key is missing', async () => {
  data.encryptionReady = false;
  mount();
  expect(
    await screen.findByText(/chưa có AI_CONFIG_ENCRYPTION_KEY/)
  ).toBeTruthy();
  expect(
    (screen.getByRole('button', { name: 'Thêm kết nối' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
});
it('imports the existing environment connection without asking the browser to resend its key', async () => {
  data.source = 'environment';
  data.connections = [];
  const initialize = vi
    .spyOn(aiSettingsService, 'initialize')
    .mockResolvedValue({ ...data, source: 'database', revision: 1 });
  mount();
  fireEvent.click(
    await screen.findByRole('button', { name: 'Nhập cấu hình hiện tại' })
  );
  await waitFor(() => expect(initialize).toHaveBeenCalledWith(1));
  expect(await screen.findByText('Đã nhập cấu hình môi trường.')).toBeTruthy();
});
it('selects OpenAI with a fresh credential and provider-specific model suggestions', async () => {
  data.providerModels = {
    gemini: ['gemini-3.1-flash-lite'],
    openai: ['gpt-4.1-mini'],
    xai: ['grok-4.7'],
  };
  const save = vi
    .spyOn(aiSettingsService, 'connection')
    .mockResolvedValue({ ...data, revision: 2 });
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Thêm kết nối' }));
  fireEvent.change(screen.getByLabelText('Tên kết nối'), {
    target: { value: 'GPT chính' },
  });
  fireEvent.change(screen.getByLabelText('API key'), {
    target: { value: 'old-gemini-credential' },
  });
  fireEvent.change(screen.getByLabelText('Nhà cung cấp'), {
    target: { value: 'openai' },
  });
  expect((screen.getByLabelText('API key') as HTMLInputElement).value).toBe('');
  expect(
    (screen.getByLabelText('Model trả lời') as HTMLInputElement).value
  ).toBe('gpt-4.1-mini');
  fireEvent.change(screen.getByLabelText('API key'), {
    target: { value: 'new-openai-credential' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Lưu kết nối' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        apiKey: 'new-openai-credential',
      }),
      undefined
    )
  );
});

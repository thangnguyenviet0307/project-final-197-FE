import { aiEmbeddingsService } from '@/features/ai/services/ai-embeddings.service';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
  act,
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
function mount(canManage = true) {
  render(
    <QueryClientProvider client={client}>
      <AiConfiguration canManage={canManage} />
    </QueryClientProvider>
  );
}

it('viewers can read configuration but cannot submit operating changes', async () => {
  const save = vi.spyOn(aiSettingsService, 'save');
  mount(false);
  const add = await screen.findByRole('button', { name: 'Thêm kết nối' });
  expect((add.closest('fieldset') as HTMLFieldSetElement).disabled).toBe(true);
  const submit = screen.getByRole('button', { name: 'Lưu vận hành' });
  fireEvent.submit(submit.closest('form')!);
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByText('Gemini chính')).toBeTruthy();
});

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

it.each([true, false])(
  'paginates configuration history without disabling navigation for viewers (manage=%s)',
  async (canManage) => {
    data.audit = Array.from({ length: 25 }, (_, index) => ({
      action: 'settings.updated',
      actor: `actor-${index}`,
      at: new Date(2026, 0, 1, 0, 0, index).toISOString(),
    }));
    mount(canManage);
    const history = within(
      await screen.findByRole('region', { name: 'Lịch sử thay đổi cấu hình' })
    );
    expect(history.getAllByRole('row')).toHaveLength(11);
    expect(history.getByText('actor-0')).toBeTruthy();
    const last = history.getByRole('button', {
      name: 'Trang cuối',
    }) as HTMLButtonElement;
    expect(last.disabled).toBe(false);
    expect(last.closest('fieldset')).toBeNull();
    fireEvent.click(last);
    expect(history.getByText('Trang 3 / 3')).toBeTruthy();
    expect(history.getAllByRole('row')).toHaveLength(6);
    expect(history.getByText('actor-24')).toBeTruthy();
    expect(history.queryByText('actor-0')).toBeNull();
    fireEvent.click(history.getByRole('button', { name: 'Trang đầu' }));
    expect(history.getByText('actor-0')).toBeTruthy();
    if (!canManage)
      expect(history.queryByRole('button', { name: 'Xóa lịch sử' })).toBeNull();
  }
);

it('confirms clearing history and resets pagination after success without changing settings', async () => {
  data.audit = Array.from({ length: 11 }, (_, index) => ({
    action: 'settings.updated',
    actor: `actor-${index}`,
    at: new Date().toISOString(),
  }));
  const cleared = { ...data, revision: 2, audit: [] };
  const clear = vi
    .spyOn(aiSettingsService, 'clearAudit')
    .mockResolvedValue(cleared);
  mount();
  const history = within(
    await screen.findByRole('region', { name: 'Lịch sử thay đổi cấu hình' })
  );
  fireEvent.click(history.getByRole('button', { name: 'Trang cuối' }));
  fireEvent.click(history.getByRole('button', { name: 'Xóa lịch sử' }));
  expect(clear).not.toHaveBeenCalled();
  fireEvent.click(history.getByRole('button', { name: 'Hủy' }));
  expect(clear).not.toHaveBeenCalled();
  fireEvent.click(history.getByRole('button', { name: 'Xóa lịch sử' }));
  fireEvent.click(
    history.getByRole('button', { name: 'Xác nhận xóa lịch sử' })
  );
  await waitFor(() => expect(clear).toHaveBeenCalledWith(1));
  expect(
    await history.findByText('Chưa có thay đổi cấu hình trên web.')
  ).toBeTruthy();
  expect(history.queryByRole('navigation')).toBeNull();
  expect(
    (history.getByRole('button', { name: 'Xóa lịch sử' }) as HTMLButtonElement)
      .disabled
  ).toBe(true);
  expect(client.getQueryData(['ai', 'admin', 'settings'])).toMatchObject({
    settings: data.settings,
    connections: data.connections,
    audit: [],
  });
});

it('keeps the confirmed revision and retains new history after a stale deletion is rejected', async () => {
  data.audit = [
    {
      action: 'settings.updated',
      actor: 'original',
      at: new Date().toISOString(),
    },
  ];
  const clear = vi
    .spyOn(aiSettingsService, 'clearAudit')
    .mockRejectedValue(new Error('Configuration changed. Reload.'));
  mount();
  const history = within(
    await screen.findByRole('region', { name: 'Lịch sử thay đổi cấu hình' })
  );
  fireEvent.click(history.getByRole('button', { name: 'Xóa lịch sử' }));
  data = {
    ...data,
    revision: 2,
    audit: [
      {
        action: 'connection.tested',
        actor: 'new-entry',
        at: new Date().toISOString(),
      },
      ...data.audit,
    ],
  };
  await act(async () => {
    client.setQueryData(['ai', 'admin', 'settings'], data);
  });
  fireEvent.click(
    history.getByRole('button', { name: 'Xác nhận xóa lịch sử' })
  );
  await waitFor(() => expect(clear).toHaveBeenCalledWith(1));
  expect(await history.findByText('new-entry')).toBeTruthy();
  await waitFor(() =>
    expect(
      history.queryByRole('group', { name: 'Xác nhận xóa lịch sử' })
    ).toBeNull()
  );
  expect(history.getByRole('alert')).toBeTruthy();
});

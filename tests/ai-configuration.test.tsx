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
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

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
  useAuthStore.setState({ user: null });
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});
function setRole(role: 'admin' | 'super_admin') {
  useAuthStore.setState({
    user: {
      id: 'operator',
      name: 'Operator',
      firstName: 'AI',
      lastName: 'Operator',
      email: 'operator@example.test',
      role,
      mustChangePassword: false,
    },
  });
}
it('Super Admin confirms clearing only configuration audit and returns to page one', async () => {
  setRole('super_admin');
  data.audit = Array.from({ length: 12 }, (_, i) => ({
    at: '2026-11-14T00:00:00Z',
    actor: `clear-actor-${i}`,
    action: 'settings.updated',
  }));
  const clear = vi
    .spyOn(aiSettingsService, 'clearAudit')
    .mockImplementation(async () => {
      data = { ...data, revision: 2, audit: [] };
      return data;
    });
  mount();
  await screen.findByText('clear-actor-0');
  fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
  expect(screen.getByText('clear-actor-10')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Xóa lịch sử cấu hình' }));
  expect(clear).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận xóa lịch sử' }));
  await waitFor(() => expect(clear).toHaveBeenCalledWith(1));
  expect(await screen.findByText('Chưa có thay đổi cấu hình.')).toBeTruthy();
  expect(screen.getByText('Trang 1/1')).toBeTruthy();
});
it('Admin cannot see the clear-audit action', async () => {
  setRole('admin');
  data.audit = [
    { at: '2026-11-14T00:00:00Z', actor: 'admin', action: 'settings.updated' },
  ];
  mount();
  await screen.findByText('Cập nhật vận hành');
  expect(
    screen.queryByRole('button', { name: 'Xóa lịch sử cấu hình' })
  ).toBeNull();
});
it('only Super Admin can confirm a quota-consuming activation', async () => {
  const successToast = vi.spyOn(toast, 'success');
  setRole('super_admin');
  const activate = vi
    .spyOn(aiSettingsService, 'activate')
    .mockImplementation(async () => {
      data = {
        ...data,
        revision: 2,
        settings: { ...data.settings, enabled: true },
      };
      return data;
    });
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Kích hoạt AI' }));
  expect(activate).not.toHaveBeenCalled();
  expect(
    screen.getByRole('group', { name: 'Xác nhận kích hoạt AI' })
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận kích hoạt' }));
  await waitFor(() => expect(activate).toHaveBeenCalledWith(1));
  await waitFor(() =>
    expect(successToast).toHaveBeenCalledWith(
      'Kết nối AI đã được kiểm tra thành công và trợ lý đã được bật.'
    )
  );
  expect(
    screen.queryByText(
      'Kết nối AI đã được kiểm tra thành công và trợ lý đã được bật.'
    )
  ).toBeNull();
  expect(screen.getByRole('button', { name: 'Kết nối lại AI' })).toBeTruthy();
});
it('does not show the activation action to Admin and honors emergency stop', async () => {
  setRole('admin');
  const view = render(
    <QueryClientProvider client={client}>
      <AiConfiguration />
    </QueryClientProvider>
  );
  await screen.findByText('Vận hành AI');
  expect(screen.queryByRole('button', { name: 'Kích hoạt AI' })).toBeNull();
  view.unmount();
  setRole('super_admin');
  data.emergencyDisabled = true;
  client.clear();
  mount();
  expect(
    (
      (await screen.findByRole('button', {
        name: 'Kích hoạt AI',
      })) as HTMLButtonElement
    ).disabled
  ).toBe(true);
});
function mount() {
  render(
    <QueryClientProvider client={client}>
      <AiConfiguration />
    </QueryClientProvider>
  );
}

it('shows automatic routing without any credential editor or model selection', async () => {
  data.routing = [
    { provider: 'gemini', model: 'gemini-test', priority: 1, retryAt: null },
    {
      provider: 'groq',
      model: 'llama-test',
      priority: 2,
      retryAt: '2026-11-14T12:00:00Z',
    },
  ];
  mount();
  expect(await screen.findByText('Google Gemini')).toBeTruthy();
  expect(screen.getByText('gemini-test')).toBeTruthy();
  expect(screen.getByText('Groq')).toBeTruthy();
  expect(screen.getByText('llama-test')).toBeTruthy();
  expect(screen.getByText('Tự động chuyển mô hình AI')).toBeTruthy();
  expect(
    screen.getByRole('switch', { name: 'Tự động đồng bộ kiến thức' })
  ).toBeTruthy();
  expect(screen.getByText('Tạm chờ')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Thêm kết nối' })).toBeNull();
  expect(screen.queryByLabelText('API key')).toBeNull();
  expect(screen.queryByLabelText('Kết nối đang chọn')).toBeNull();
  expect(document.body.textContent).not.toContain('?');
});
it('shows all four providers with honest missing configuration statuses', async () => {
  data.routing = [
    {
      provider: 'gemini',
      model: 'gemini-test',
      priority: 1,
      state: 'ready',
      retryAt: null,
    },
    {
      provider: 'groq',
      model: 'llama-test',
      priority: null,
      state: 'missing_key',
      retryAt: null,
    },
    {
      provider: 'openrouter',
      model: 'openrouter/free',
      priority: null,
      state: 'excluded',
      retryAt: null,
    },
    {
      provider: 'cloudflare',
      model: '@cf/test',
      priority: null,
      state: 'missing_account',
      retryAt: null,
    },
  ];
  mount();
  await screen.findByText('Google Gemini');
  for (const name of ['Groq', 'OpenRouter', 'Cloudflare Workers AI'])
    expect(screen.getByText(name)).toBeTruthy();
  expect(screen.getByText('Chưa cấu hình khóa API')).toBeTruthy();
  expect(screen.getByText('Thiếu mã tài khoản Cloudflare')).toBeTruthy();
  expect(screen.getByText('Không nằm trong thứ tự ưu tiên')).toBeTruthy();
});
it('saves operating flags without selecting a connection or persisting keys', async () => {
  const successToast = vi.spyOn(toast, 'success');
  const save = vi
    .spyOn(aiSettingsService, 'save')
    .mockResolvedValue({ ...data, revision: 2 });
  mount();
  fireEvent.click(await screen.findByRole('switch', { name: 'Bật trợ lý AI' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu cấu hình' }));
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      ...data.settings,
      revision: 1,
      enabled: true,
    })
  );
  await waitFor(() =>
    expect(successToast).toHaveBeenCalledExactlyOnceWith(
      'Đã lưu cấu hình vận hành.'
    )
  );
  expect(screen.queryByText('Đã lưu cấu hình vận hành.')).toBeNull();
});
it('shows one error toast when saving fails without an inline error banner', async () => {
  const errorToast = vi.spyOn(toast, 'error');
  vi.spyOn(aiSettingsService, 'save').mockRejectedValue(
    new Error('Save failed')
  );
  mount();
  fireEvent.click(await screen.findByRole('button', { name: 'Lưu cấu hình' }));
  await waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole('alert')).toBeNull();
});
it('blocks enabling semantic search before activation without blocking chat enablement', async () => {
  data.semanticReady = false;
  mount();
  const semantic = await screen.findByRole('switch', {
    name: 'Tìm kiếm ngữ nghĩa',
  });
  expect(semantic.hasAttribute('data-disabled')).toBe(true);
  expect(screen.getAllByRole('switch')[0].hasAttribute('data-disabled')).toBe(
    false
  );
  expect(screen.getByText(/Bạn vẫn có thể bật trợ lý AI/)).toBeTruthy();
});
it('allows disabling a stale semantic setting even without a ready generation', async () => {
  data.semanticReady = false;
  data.settings.semanticEnabled = true;
  mount();
  const semantic = await screen.findByRole('switch', {
    name: 'Tìm kiếm ngữ nghĩa',
  });
  expect(semantic.hasAttribute('data-disabled')).toBe(false);
  fireEvent.click(semantic);
  expect(semantic.hasAttribute('data-disabled')).toBe(true);
});
it('keeps configuration audit pagination independent of operating changes', async () => {
  data.audit = Array.from({ length: 12 }, (_, i) => ({
    at: '2026-11-14T00:00:00Z',
    actor: `actor-${i}`,
    action: 'settings.updated',
  }));
  mount();
  await screen.findByText('actor-0');
  expect(screen.queryByText('actor-10')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
  expect(screen.getByText('actor-10')).toBeTruthy();
  expect(screen.queryByText('actor-0')).toBeNull();
});

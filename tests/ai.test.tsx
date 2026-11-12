import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const socketMocks = vi.hoisted(() => ({ io: vi.fn() }));
vi.mock('socket.io-client', () => ({ io: socketMocks.io }));
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ChatWidget } from '@/features/ai/components/chat-widget';
import { aiService } from '@/features/ai/services/ai.service';
import { useAuthStore } from '@/stores/auth.store';
import { chatInputSchema, completedSchema } from '@/features/ai/schemas/ai';
import type { AiHistory } from '@/features/ai/types/ai';
import type { ReactNode } from 'react';
import { useAiSearch } from '@/features/ai/hooks/use-ai-products';
const id = 'a'.repeat(24);
let history: AiHistory;
let clients: QueryClient[] = [];
beforeEach(() => {
  socketMocks.io.mockReset();
  useAuthStore.setState({
    isLoading: false,
    isAuthenticated: false,
    sessionId: null,
    accessToken: null,
  });
  history = {
    conversation: {
      id,
      status: 'active',
      endedAt: null,
      lastActivityAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    rows: [],
    page: 1,
  };
  vi.spyOn(aiService, 'list').mockResolvedValue({
    rows: [
      { _id: id, status: 'active', lastActivityAt: new Date().toISOString() },
    ],
    total: 1,
  });
  vi.spyOn(aiService, 'history').mockImplementation(async () => history);
  vi.spyOn(aiService, 'end').mockImplementation(async () => {
    history = {
      ...history,
      conversation: { ...history.conversation, status: 'completed' },
    };
  });
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => {
  clients.forEach((c) => c.clear());
  clients = [];
  vi.restoreAllMocks();
});
function mount(extra?: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        {extra}
        <ChatWidget />
      </MemoryRouter>
    </QueryClientProvider>
  );
}
it('minimizing preserves a conversation, while explicit completion closes it', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  const row = await screen.findByRole('button', { name: /Đang mở/ });
  fireEvent.click(row);
  await waitFor(() => expect(aiService.history).toHaveBeenCalledWith(id, 1));
  fireEvent.click(screen.getByRole('button', { name: 'Thu nhỏ trợ lý' }));
  expect(aiService.end).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByRole('button', { name: 'Kết thúc' }));
  expect(aiService.end).not.toHaveBeenCalled();
  expect(window.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận kết thúc' }));
  await waitFor(() => expect(aiService.end).toHaveBeenCalledWith(id));
  await screen.findByText(
    'Hội thoại đã kết thúc. Chọn “Chat mới” để tiếp tục.'
  );
  expect(
    (screen.getByRole('button', { name: 'Gửi' }) as HTMLButtonElement).disabled
  ).toBe(true);
});
it('changing account clears the current transcript and uses a separate query cache', async () => {
  history.rows = [
    {
      requestId: 'old',
      content: 'Nội dung riêng của khách cũ',
      answer: 'Trả lời cũ',
      status: 'completed',
      sources: [],
    },
  ];
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  await screen.findByText('Nội dung riêng của khách cũ');
  useAuthStore.setState({
    sessionId: 'different-customer',
    isAuthenticated: true,
  });
  await waitFor(() =>
    expect(screen.queryByText('Nội dung riêng của khách cũ')).toBeNull()
  );
});

it('confirms ending inside the chat and can keep the conversation open', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Kết thúc' }));
  expect(
    screen.getByRole('group', { name: 'Xác nhận kết thúc hội thoại' })
  ).toBeTruthy();
  expect(aiService.end).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục trò chuyện' }));
  expect(
    screen.queryByRole('group', { name: 'Xác nhận kết thúc hội thoại' })
  ).toBeNull();
  expect(window.confirm).not.toHaveBeenCalled();
  expect(aiService.end).not.toHaveBeenCalled();
});

it('explains failed, cancelled and uncertain history turns inside the chat', async () => {
  history.rows = ['failed', 'cancelled', 'processing'].map((status) => ({
    requestId: status,
    content: `Question ${status}`,
    status,
    sources: [],
    answer: status === 'cancelled' ? 'Nội dung trả lời một phần' : '',
  }));
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  expect(
    await screen.findByText(
      'Trợ lý chưa thể trả lời câu hỏi này. Bạn có thể thử gửi lại.'
    )
  ).toBeTruthy();
  expect(screen.getByText('Đã dừng trả lời câu hỏi này.')).toBeTruthy();
  expect(screen.getByText('Nội dung trả lời một phần')).toBeTruthy();
  expect(
    screen.getByText(
      'Chưa có kết quả được xác nhận. Chọn “Tải lại” để kiểm tra trạng thái.'
    )
  ).toBeTruthy();
  expect(screen.queryByText('Lượt trả lời chưa hoàn tất.')).toBeNull();
});
it('shows the agreed retention policy and rejects unsafe sources or oversized input', async () => {
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  expect(screen.getByText(/24 giờ kể từ khi kết thúc/)).toBeTruthy();
  expect(chatInputSchema.safeParse('x'.repeat(2001)).success).toBe(false);
  expect(
    completedSchema.safeParse({
      answer: 'a',
      status: 'completed',
      sources: [{ key: 'bad', title: 'bad', href: '//evil.example' }],
    }).success
  ).toBe(false);
});
it('uses Socket.IO events and clears the draft only after acceptance', async () => {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const connection = {
    connected: false,
    removeAllListeners: vi.fn(() => {
      handlers.clear();
      return connection;
    }),
    on: vi.fn((name: string, fn: (...args: unknown[]) => void) => {
      handlers.set(name, fn);
      return connection;
    }),
    emit: vi.fn(),
    connect: vi.fn(() => {
      connection.connected = true;
      handlers.get('chat:ready')?.({ type: 'chat:ready' });
      return connection;
    }),
    disconnect: vi.fn(() => {
      if (connection.connected) {
        connection.connected = false;
        handlers.get('disconnect')?.();
      }
      return connection;
    }),
  };
  socketMocks.io.mockReturnValue(connection);
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ephemeral-ticket');
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.change(screen.getByLabelText('Câu hỏi cho trợ lý'), {
    target: { value: 'Tìm sản phẩm' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
  await waitFor(() =>
    expect(connection.emit).toHaveBeenCalledWith(
      'chat:send',
      expect.objectContaining({ conversationId: id, content: 'Tìm sản phẩm' })
    )
  );
  expect(socketMocks.io).toHaveBeenCalledWith(
    expect.not.stringContaining('ticket='),
    expect.objectContaining({
      auth: { ticket: 'ephemeral-ticket', accessToken: null },
      reconnection: false,
      path: '/api/v1/ai/socket',
    })
  );
  const request = connection.emit.mock.calls[0]![1] as { requestId: string };
  expect(
    (screen.getByLabelText('Câu hỏi cho trợ lý') as HTMLTextAreaElement).value
  ).toBe('Tìm sản phẩm');
  handlers.get('chat:accepted')?.({
    type: 'chat:accepted',
    requestId: request.requestId,
  });
  await waitFor(() =>
    expect(
      (screen.getByLabelText('Câu hỏi cho trợ lý') as HTMLTextAreaElement).value
    ).toBe('')
  );
  handlers.get('chat:delta')?.({
    type: 'chat:delta',
    requestId: request.requestId,
    data: 'Sản phẩm phù hợp',
  });
  await screen.findByText('Sản phẩm phù hợp');
  vi.mocked(aiService.history).mockClear();
  handlers.get('chat:completed')?.({
    type: 'chat:completed',
    requestId: request.requestId,
    data: {
      answer: 'Sản phẩm phù hợp',
      status: 'completed',
      sources: [],
      products: [],
    },
  });
  await waitFor(() => expect(connection.disconnect).toHaveBeenCalled());
  await waitFor(() => expect(aiService.history).toHaveBeenCalledWith(id, 1));
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function socketFixture(ready = true) {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  const socket = {
    connected: false,
    on: vi.fn((name: string, handler: (...args: unknown[]) => void) => {
      handlers.set(name, handler);
      return socket;
    }),
    emit: vi.fn(),
    removeAllListeners: vi.fn(() => {
      handlers.clear();
      return socket;
    }),
    connect: vi.fn(() => {
      socket.connected = ready;
      if (ready) handlers.get('chat:ready')?.({ type: 'chat:ready' });
      return socket;
    }),
    disconnect: vi.fn(() => {
      if (socket.connected) {
        socket.connected = false;
        handlers.get('disconnect')?.();
      }
      return socket;
    }),
  };
  socketMocks.io.mockReturnValue(socket);
  return { socket, handlers };
}
function openAndSend(text: string) {
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.change(screen.getByLabelText('Câu hỏi cho trợ lý'), {
    target: { value: text },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
}
it.each(['create', 'ticket'] as const)(
  'stops during %s preparation and preserves the draft without a later socket',
  async (phase) => {
    const pending = deferred<{ id: string } | string>();
    let signal: AbortSignal | undefined;
    vi.spyOn(aiService, 'create').mockImplementation(async (value) => {
      if (phase === 'create') {
        signal = value;
        return (await pending.promise) as { id: string };
      }
      return { id };
    });
    vi.spyOn(aiService, 'ticket').mockImplementation(async (value) => {
      signal = value;
      return (await pending.promise) as string;
    });
    mount();
    openAndSend('Giữ câu hỏi đang nhập');
    await waitFor(() =>
      expect(
        phase === 'create' ? aiService.create : aiService.ticket
      ).toHaveBeenCalled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      pending.resolve(phase === 'create' ? { id } : 'ticket');
    });
    expect(socketMocks.io).not.toHaveBeenCalled();
    expect(
      (screen.getByLabelText('Câu hỏi cho trợ lý') as HTMLTextAreaElement).value
    ).toBe('Giữ câu hỏi đang nhập');
    expect(
      (screen.getByRole('button', { name: 'Gửi' }) as HTMLButtonElement)
        .disabled
    ).toBe(false);
  }
);
it('stops while Socket.IO is connecting and ignores late ready events', async () => {
  const { socket, handlers } = socketFixture(false);
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
  mount();
  openAndSend('Chưa kết nối');
  await waitFor(() => expect(socket.connect).toHaveBeenCalled());
  const lateReady = handlers.get('chat:ready');
  fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
  await act(async () => {
    lateReady?.({ type: 'chat:ready' });
  });
  expect(socket.emit).not.toHaveBeenCalled();
  expect(socket.disconnect).toHaveBeenCalled();
  expect(
    (screen.getByLabelText('Câu hỏi cho trợ lý') as HTMLTextAreaElement).value
  ).toBe('Chưa kết nối');
});
it('waits for durable cancellation confirmation and ignores late completed events', async () => {
  const cancelled = deferred<Awaited<ReturnType<typeof aiService.cancel>>>();
  const cancel = vi
    .spyOn(aiService, 'cancel')
    .mockReturnValue(cancelled.promise);
  const { socket, handlers } = socketFixture();
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
  mount();
  openAndSend('Câu hỏi đã nhận');
  await waitFor(() => expect(socket.emit).toHaveBeenCalled());
  const { requestId } = socket.emit.mock.calls[0]![1] as { requestId: string };
  await act(async () => {
    handlers.get('chat:accepted')?.({ type: 'chat:accepted', requestId });
    handlers.get('chat:delta')?.({
      type: 'chat:delta',
      requestId,
      data: 'Nội dung từng phần',
    });
  });
  const lateCompleted = handlers.get('chat:completed');
  fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
  expect(cancel).toHaveBeenCalledWith(id, requestId, 'Câu hỏi đã nhận');
  expect(screen.getByText('Đang dừng…')).toBeTruthy();
  expect(screen.queryByText('Đã dừng lượt trả lời.')).toBeNull();
  await act(async () => {
    lateCompleted?.({
      type: 'chat:completed',
      requestId,
      data: {
        answer: 'Không được ghi đè',
        status: 'completed',
        sources: [],
        products: [],
      },
    });
  });
  expect(screen.queryByText('Không được ghi đè')).toBeNull();
  expect(screen.getByText('Nội dung từng phần')).toBeTruthy();
  expect(socket.disconnect).toHaveBeenCalled();
  await act(async () =>
    cancelled.resolve({
      requestId,
      status: 'cancelled',
      answer: '',
      sources: [],
    })
  );
  expect(await screen.findByText('Đã dừng lượt trả lời.')).toBeTruthy();
});

it.each(['completed', 'unavailable'] as const)(
  'cancel reports %s without claiming cancellation',
  async (outcome) => {
    const { socket, handlers } = socketFixture();
    vi.spyOn(aiService, 'create').mockResolvedValue({ id });
    vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
    const cancel = vi.spyOn(aiService, 'cancel');
    if (outcome === 'completed')
      cancel.mockResolvedValue({
        requestId: 'saved',
        status: 'completed',
        answer: 'Kết quả đã lưu',
        sources: [],
      });
    else cancel.mockRejectedValue(new Error('Network unavailable'));
    mount();
    openAndSend('Câu hỏi');
    await waitFor(() => expect(socket.emit).toHaveBeenCalled());
    const { requestId } = socket.emit.mock.calls[0]![1] as {
      requestId: string;
    };
    await act(async () =>
      handlers.get('chat:accepted')?.({ type: 'chat:accepted', requestId })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(
      await screen.findByText(
        outcome === 'completed'
          ? 'Lượt trả lời đã hoàn tất trước khi yêu cầu dừng được xác nhận.'
          : 'Chưa xác nhận được yêu cầu dừng. Hãy tải lại lịch sử để kiểm tra trạng thái.'
      )
    ).toBeTruthy();
    expect(screen.queryByText('Đã dừng lượt trả lời.')).toBeNull();
  }
);

it('processing replay stays processing and does not masquerade as completion', async () => {
  const { socket, handlers } = socketFixture();
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
  mount();
  openAndSend('Câu hỏi đang chạy');
  await waitFor(() => expect(socket.emit).toHaveBeenCalled());
  const { requestId } = socket.emit.mock.calls[0]![1] as { requestId: string };
  await act(async () =>
    handlers.get('chat:processing')?.({
      type: 'chat:processing',
      requestId,
      data: { status: 'processing' },
    })
  );
  expect(
    await screen.findByText(
      'Lượt này vẫn đang xử lý. Hãy tải lại lịch sử để xem kết quả.'
    )
  ).toBeTruthy();
  expect(
    completedSchema.safeParse({
      answer: '',
      status: 'processing',
      sources: [],
      products: [],
    }).success
  ).toBe(false);
});

it.each(['cancelled', 'failed'] as const)(
  'uses the confirmed %s state and safe server feedback inside chat',
  async (status) => {
    const { socket, handlers } = socketFixture();
    vi.spyOn(aiService, 'create').mockResolvedValue({ id });
    vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
    mount();
    openAndSend('Câu hỏi kiểm tra phản hồi');
    await waitFor(() => expect(socket.emit).toHaveBeenCalled());
    const { requestId } = socket.emit.mock.calls[0]![1] as {
      requestId: string;
    };
    await act(async () => {
      handlers.get('chat:error')?.({
        type: 'chat:error',
        requestId,
        data: { status, message: 'Thông báo an toàn từ dịch vụ AI.' },
      });
    });
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Thông báo an toàn từ dịch vụ AI.'
    );
    expect(screen.getAllByText('Thông báo an toàn từ dịch vụ AI.').length).toBe(
      2
    );
  }
);
it('restores the persisted credit-limit explanation inside historical chat', async () => {
  history.rows = [
    {
      requestId: 'failed-quota',
      content: 'Tìm tai nghe',
      answer: '',
      status: 'failed',
      sources: [],
      error: {
        code: 'AI_CREDIT_EXHAUSTED',
        message: 'Trợ lý tạm chưa khả dụng do hạn mức dịch vụ.',
      },
    },
  ];
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  expect(
    await screen.findByText('Trợ lý tạm chưa khả dụng do hạn mức dịch vụ.')
  ).toBeTruthy();
  expect(window.confirm).not.toHaveBeenCalled();
});
it('sends with Enter while keeping Shift+Enter and IME composition available', async () => {
  const { socket } = socketFixture();
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  const input = screen.getByLabelText('Câu hỏi cho trợ lý');
  fireEvent.change(input, { target: { value: 'Tìm tai nghe dưới 500k' } });
  fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
  fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
  expect(socket.emit).not.toHaveBeenCalled();
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(() =>
    expect(socket.emit).toHaveBeenCalledWith(
      'chat:send',
      expect.objectContaining({ content: 'Tìm tai nghe dưới 500k' })
    )
  );
});
it('keeps a draft when ticket creation fails', async () => {
  vi.spyOn(aiService, 'create').mockResolvedValue({ id });
  vi.spyOn(aiService, 'ticket').mockRejectedValue(new Error('Ticket failed'));
  mount();
  openAndSend('Không mất bản nháp');
  await waitFor(() =>
    expect(
      (screen.getByRole('button', { name: 'Gửi' }) as HTMLButtonElement)
        .disabled
    ).toBe(false)
  );
  expect(
    (screen.getByLabelText('Câu hỏi cho trợ lý') as HTMLTextAreaElement).value
  ).toBe('Không mất bản nháp');
  expect(socketMocks.io).not.toHaveBeenCalled();
});
it('late completion of chat A cannot clear streaming content in chat B', async () => {
  const b = 'b'.repeat(24);
  const ended = deferred<void>();
  const { socket, handlers } = socketFixture();
  vi.mocked(aiService.end).mockImplementation(() => ended.promise);
  vi.mocked(aiService.history).mockImplementation(async (target) => ({
    ...history,
    conversation: { ...history.conversation, id: target },
    rows: [],
  }));
  vi.spyOn(aiService, 'create').mockResolvedValue({ id: b });
  vi.spyOn(aiService, 'ticket').mockResolvedValue('ticket');
  mount();
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  await waitFor(() => expect(aiService.history).toHaveBeenCalledWith(id, 1));
  fireEvent.click(screen.getByRole('button', { name: 'Kết thúc' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận kết thúc' }));
  fireEvent.click(screen.getByRole('button', { name: 'Chat mới' }));
  fireEvent.change(screen.getByLabelText('Câu hỏi cho trợ lý'), {
    target: { value: 'Câu hỏi của B' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
  await waitFor(() => expect(socket.emit).toHaveBeenCalled());
  const { requestId } = socket.emit.mock.calls[0]![1] as { requestId: string };
  await act(async () => {
    handlers.get('chat:accepted')?.({ type: 'chat:accepted', requestId });
  });
  await act(async () => {
    ended.resolve();
  });
  await act(async () => {
    handlers.get('chat:delta')?.({
      type: 'chat:delta',
      requestId,
      data: 'B tiếp tục trả lời',
    });
  });
  expect(screen.getByText('Câu hỏi của B')).toBeTruthy();
  expect(screen.getByText('B tiếp tục trả lời')).toBeTruthy();
});
it('restores product cards from history and only refreshes conversation queries on completion', async () => {
  const search = vi.spyOn(aiService, 'search').mockResolvedValue({
    rows: [],
    total: 0,
    page: 1,
    limit: 10,
    semantic: false,
  });
  function SearchObserver() {
    useAiSearch({ q: 'phone' });
    return null;
  }
  history.rows = [
    {
      requestId: 'saved',
      content: 'Gợi ý',
      answer: 'Đây là sản phẩm',
      status: 'completed',
      sources: [],
      products: [
        {
          id: 'p',
          slug: 'live-product',
          name: 'Sản phẩm đã gợi ý',
          price: 345,
          available: true,
          thumbnail: null,
          brand: 'Brand',
          category: 'Category',
          description: '',
        },
      ],
    },
  ];
  mount(<SearchObserver />);
  await waitFor(() => expect(search).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole('button', { name: 'Mở trợ lý mua sắm AI' }));
  fireEvent.click(screen.getByText('Lịch sử hội thoại'));
  fireEvent.click(await screen.findByRole('button', { name: /Đang mở/ }));
  expect(
    await screen.findByRole('link', { name: /Sản phẩm đã gợi ý/ })
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Kết thúc' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xác nhận kết thúc' }));
  await screen.findByText(
    'Hội thoại đã kết thúc. Chọn “Chat mới” để tiếp tục.'
  );
  expect(search).toHaveBeenCalledTimes(1);
});

import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { getApiError } from '@/services/api';
import { aiService, socketEndpoint } from '../services/ai.service';
import {
  chatInputSchema,
  completedSchema,
  socketEventSchema,
} from '../schemas/ai';
import type { AiProduct, AiTurn } from '../types/ai';
export function useChat(open: boolean) {
  const identity = useAuthStore((s) => s.sessionId) || 'guest';
  const [id, setId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [live, setLive] = useState<AiTurn | null>(null);
  const [products, setProducts] = useState<AiProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [clock, setClock] = useState(Date.now);
  const socket = useRef<Socket | null>(null);
  const disposeSocket = useRef<(() => void) | null>(null);
  const active = useRef(false);
  const sendController = useRef<AbortController | null>(null);
  const activeTurn = useRef<{
    requestId: string;
    conversationId: string | null;
    accepted: boolean;
  } | null>(null);
  const endingRef = useRef(new Set<string>());
  const [endingIds, setEndingIds] = useState<string[]>([]);
  const generation = useRef(0);
  const client = useQueryClient();
  const list = useQuery({
    queryKey: ['ai', identity, 'conversations', page],
    queryFn: () => aiService.list(page),
    enabled: open,
    meta: { suppressGlobalErrorToast: true },
  });
  const history = useQuery({
    queryKey: ['ai', identity, 'history', id, historyPage],
    queryFn: () => aiService.history(id!, historyPage),
    enabled: open && !!id,
    meta: { suppressGlobalErrorToast: true },
  });
  const refresh = (conversationId: string | null = id) => {
    const requests = [
      client.invalidateQueries({
        queryKey: ['ai', identity, 'conversations'],
      }),
    ];
    if (conversationId)
      requests.push(
        client.invalidateQueries({
          queryKey: ['ai', identity, 'history', conversationId],
        })
      );
    return Promise.all(requests);
  };
  useEffect(
    () => () => {
      generation.current++;
      sendController.current?.abort();
      disposeSocket.current?.();
    },
    []
  );
  useEffect(() => {
    if (!id || !history.data) return;
    const { conversation, rows } = history.data;
    const deadlines = [
      new Date(conversation.expiresAt).getTime(),
      ...rows.map((t) =>
        new Date(t.expiresAt || conversation.expiresAt).getTime()
      ),
    ];
    if (conversation.status === 'active')
      deadlines.push(new Date(conversation.lastActivityAt).getTime() + 3600000);
    const remaining =
      Math.min(...deadlines.filter((d) => d > Date.now())) - Date.now();
    if (!Number.isFinite(remaining)) return;
    const timer = window.setTimeout(
      () => {
        setClock(Date.now());
        void client.invalidateQueries({
          queryKey: ['ai', identity, 'history', id],
        });
        void client.invalidateQueries({
          queryKey: ['ai', identity, 'conversations'],
        });
      },
      Math.min(2147483647, Math.max(1000, remaining))
    );
    return () => clearTimeout(timer);
  }, [id, history.data, client, clock, identity]);
  const select = (next: string | null) => {
    generation.current++;
    sendController.current?.abort();
    disposeSocket.current?.();
    active.current = false;
    setBusy(false);
    setId(next);
    setHistoryPage(1);
    setLive(null);
    setProducts([]);
    setError('');
    setStatus('');
  };
  const send = async (value: string, onAccepted?: () => void) => {
    if (active.current) return;
    if (
      id &&
      (endingRef.current.has(id) ||
        history.data?.conversation.status === 'completed')
    ) {
      setError('Hội thoại đang kết thúc hoặc đã kết thúc. Hãy chọn Chat mới.');
      return;
    }
    const parsed = chatInputSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Câu hỏi không hợp lệ.');
      return;
    }
    active.current = true;
    setBusy(true);
    setError('');
    setProducts([]);
    setClock(Date.now());
    setStatus('Đang kết nối…');
    const currentGeneration = ++generation.current;
    const requestId = crypto.randomUUID();
    const controller = new AbortController();
    sendController.current = controller;
    const turn = { requestId, conversationId: id, accepted: false };
    activeTurn.current = turn;
    const current = () =>
      currentGeneration === generation.current && !controller.signal.aborted;
    try {
      const conversationId =
        id || (await aiService.create(controller.signal)).id;
      if (!current()) return;
      turn.conversationId = conversationId;
      setId(conversationId);
      setHistoryPage(1);
      setLive({
        requestId,
        content: parsed.data,
        answer: '',
        status: 'processing',
        sources: [],
        expiresAt: new Date(
          Date.now() +
            (useAuthStore.getState().isAuthenticated
              ? 30 * 86400000
              : 25 * 3600000)
        ).toISOString(),
      });
      const ticket = await aiService.ticket(controller.signal);
      if (!current()) return;
      const endpoint = socketEndpoint();
      const connection = io(endpoint.origin, {
        path: endpoint.path,
        transports: ['websocket'],
        autoConnect: false,
        reconnection: false,
        forceNew: true,
        timeout: 10000,
        auth: { ticket, accessToken: useAuthStore.getState().accessToken },
      });
      socket.current = connection;
      let finished = false;
      let settled = false;
      const timeout = window.setTimeout(() => {
        connection.disconnect();
        finish();
      }, 85000);
      const finish = () => {
        clearTimeout(timeout);
        if (settled) return;
        settled = true;
        if (!current()) return;
        active.current = false;
        setBusy(false);
        setStatus('');
        if (!finished)
          setError(
            'Kết nối bị ngắt. Tải lại lịch sử trước khi gửi lại để tránh tạo câu hỏi trùng.'
          );
        if (!turn.accepted)
          setLive((value) => (value?.requestId === requestId ? null : value));
        else
          setLive((value) =>
            value?.requestId === requestId && value.status === 'processing'
              ? { ...value, status: 'failed' }
              : value
          );
        if (activeTurn.current === turn) activeTurn.current = null;
        void refresh(conversationId);
      };
      disposeSocket.current = () => {
        clearTimeout(timeout);
        connection.removeAllListeners();
        connection.disconnect();
      };
      const onEvent = (event: unknown) => {
        if (!current()) return;
        try {
          const result = socketEventSchema.parse(event);
          if (result.requestId && result.requestId !== requestId) return;
          if (result.type === 'chat:accepted' && !turn.accepted) {
            turn.accepted = true;
            onAccepted?.();
          }
          if (result.type === 'chat:ready')
            connection.emit('chat:send', {
              conversationId,
              requestId,
              content: parsed.data,
            });
          if (result.type === 'chat:status' && typeof result.data === 'string')
            setStatus(result.data);
          if (result.type === 'chat:delta' && typeof result.data === 'string') {
            const delta = result.data;
            setLive((turn) =>
              turn ? { ...turn, answer: turn.answer + delta } : turn
            );
          }
          if (result.type === 'chat:completed') {
            const complete = completedSchema.parse(result.data);
            if (!turn.accepted) {
              turn.accepted = true;
              onAccepted?.();
            }
            setLive((turn) => (turn ? { ...turn, ...complete } : turn));
            setProducts(complete.products);
            finished = true;
            connection.disconnect();
          }
          if (result.type === 'chat:error') {
            setError(
              'Lượt trả lời chưa hoàn tất hoặc đã dừng. Hãy tải lại lịch sử để xem trạng thái, hoặc gửi câu hỏi mới.'
            );
            finished = true;
            connection.disconnect();
          }
        } catch {
          setError('Không đọc được phản hồi từ trợ lý.');
          connection.disconnect();
        }
      };
      for (const name of [
        'chat:ready',
        'chat:accepted',
        'chat:status',
        'chat:delta',
        'chat:completed',
        'chat:error',
      ])
        connection.on(name, onEvent);
      connection.on('disconnect', finish);
      connection.on('connect_error', () => {
        finished = true;
        connection.disconnect();
        finish();
        if (current())
          setError(
            'Không thể kết nối trợ lý hoặc phiên đã hết hạn. Vui lòng thử lại.'
          );
      });
      connection.connect();
    } catch (cause) {
      if (current()) {
        if (!turn.accepted)
          setLive((value) => (value?.requestId === requestId ? null : value));
        setError(getApiError(cause).message);
        active.current = false;
        setBusy(false);
        setStatus('');
      }
    }
  };
  const cancel = () => {
    if (!active.current) return;
    const turn = activeTurn.current;
    if (socket.current?.connected && turn)
      socket.current.emit('chat:cancel', { requestId: turn.requestId });
    generation.current++;
    sendController.current?.abort();
    disposeSocket.current?.();
    active.current = false;
    activeTurn.current = null;
    setBusy(false);
    setStatus('');
    setError('Đã dừng lượt gửi.');
    setLive((value) =>
      turn && value?.requestId === turn.requestId && turn.accepted
        ? { ...value, status: 'cancelled' }
        : null
    );
    if (turn?.conversationId) void refresh(turn.conversationId);
  };
  const end = async () => {
    if (!id || endingRef.current.has(id)) return;
    const target = id;
    cancel();
    const version = generation.current;
    endingRef.current.add(target);
    setEndingIds([...endingRef.current]);
    try {
      await aiService.end(target);
      if (version === generation.current) setLive(null);
      await refresh(target);
    } catch (cause) {
      if (version === generation.current) setError(getApiError(cause).message);
    } finally {
      endingRef.current.delete(target);
      setEndingIds([...endingRef.current]);
    }
  };
  const now = clock;
  const expired =
    history.isError ||
    (history.data &&
      new Date(history.data.conversation.expiresAt).getTime() <= now);
  const stored = history.data?.rows.find(
    (turn) => turn.requestId === live?.requestId
  );
  const current =
    historyPage === 1 &&
    live &&
    !expired &&
    new Date(live.expiresAt || 0).getTime() > now
      ? stored && stored.status !== 'processing'
        ? stored
        : live
      : null;
  const rows = expired
    ? []
    : history.data?.rows.filter(
        (turn) =>
          turn.requestId !== current?.requestId &&
          new Date(
            turn.expiresAt || history.data!.conversation.expiresAt
          ).getTime() > now
      ) || [];
  return {
    id,
    page,
    setPage,
    historyPage,
    setHistoryPage,
    select,
    list,
    history,
    rows: current
      ? [...rows, { ...current, products: current.products || products }]
      : rows,
    products: current ? products : [],
    busy,
    ending: !!id && endingIds.includes(id),
    status,
    error,
    send,
    cancel,
    end,
  };
}

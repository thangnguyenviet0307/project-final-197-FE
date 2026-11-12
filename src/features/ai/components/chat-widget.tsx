import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  X,
  ShoppingBag,
  Plus,
  RefreshCw,
  Send,
  Square,
  History,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChat } from '../hooks/use-chat';
import { AiProducts } from './ai-products';
import './chat-widget.css';

function TypingDots() {
  return (
    <span
      className="ai-typing"
      role="status"
      aria-label="Trợ lý đang soạn trả lời"
    >
      <span aria-hidden="true" />
      <span aria-hidden="true" />
      <span aria-hidden="true" />
    </span>
  );
}
function turnFeedback(status: string, streaming: boolean) {
  if (status === 'cancelled') return 'Đã dừng trả lời câu hỏi này.';
  if (status === 'failed')
    return 'Trợ lý chưa thể trả lời câu hỏi này. Bạn có thể thử gửi lại.';
  if (status === 'processing')
    return streaming ? (
      <TypingDots />
    ) : (
      'Chưa có kết quả được xác nhận. Chọn “Tải lại” để kiểm tra trạng thái.'
    );
  return 'Chưa có nội dung trả lời cho câu hỏi này.';
}
export function ChatWidget() {
  const identity = useAuthStore((s) => s.sessionId);
  const loading = useAuthStore((s) => s.isLoading);
  return loading ? null : <ChatSession key={identity || 'guest'} />;
}
function ChatSession() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [endTarget, setEndTarget] = useState<string | null>(null);
  const chat = useChat(open);
  const messagesRef = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const lastTurn = chat.rows.at(-1);
  useEffect(() => {
    followLatest.current = true;
  }, [open, chat.id, chat.historyPage]);
  useEffect(() => {
    const element = messagesRef.current;
    if (open && element && followLatest.current && chat.historyPage === 1)
      element.scrollTop = element.scrollHeight;
  }, [
    open,
    chat.id,
    chat.historyPage,
    lastTurn?.requestId,
    lastTurn?.answer,
    lastTurn?.status,
    chat.status,
    chat.error,
  ]);
  const customer = useAuthStore((s) => s.isAuthenticated);
  const completed = chat.history.data?.conversation.status === 'completed';
  const send = (value: string) => {
    if (value.trim()) {
      setEndTarget(null);
      followLatest.current = true;
      void chat.send(value, () =>
        setDraft((current) => (current === value ? '' : current))
      );
    }
  };
  return (
    <div className="ai-widget">
      {!open && (
        <button
          className="ai-launcher"
          aria-haspopup="dialog"
          aria-label="Mở trợ lý mua sắm AI"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={21} aria-hidden="true" /> Trợ lý AI
        </button>
      )}
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-title"
          className="ai-window"
        >
          <header className="ai-header">
            <div className="ai-assistant-avatar">
              <ShoppingBag size={21} aria-hidden="true" />
            </div>
            <div className="ai-heading">
              <strong id="ai-title">Trợ lý mua sắm AI</strong>
              <small>Tìm sản phẩm phù hợp cùng bạn</small>
            </div>
            <button
              aria-label="Thu nhỏ trợ lý"
              onClick={() => {
                setEndTarget(null);
                setOpen(false);
              }}
            >
              <X size={19} aria-hidden="true" />
            </button>
          </header>
          <nav aria-label="Điều khiển hội thoại">
            <button
              disabled={chat.busy}
              onClick={() => {
                setEndTarget(null);
                chat.select(null);
              }}
            >
              <Plus size={14} aria-hidden="true" /> Chat mới
            </button>
            <button
              disabled={!chat.id || completed || chat.ending}
              onClick={() => setEndTarget(chat.id)}
            >
              {chat.ending ? 'Đang kết thúc…' : 'Kết thúc'}
            </button>
            <button
              onClick={() => {
                if (chat.id) void chat.history.refetch();
                void chat.list.refetch();
              }}
            >
              <RefreshCw size={14} aria-hidden="true" /> Tải lại
            </button>
          </nav>
          {endTarget && endTarget === chat.id && !completed && (
            <div
              className="ai-confirmation"
              role="group"
              aria-label="Xác nhận kết thúc hội thoại"
            >
              <p role="status">
                Bạn muốn kết thúc hội thoại này? Bạn vẫn có thể xem lịch sử
                trong thời hạn lưu trữ.
              </p>
              <div className="ai-confirmation-actions">
                <button type="button" onClick={() => setEndTarget(null)}>
                  Tiếp tục trò chuyện
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEndTarget(null);
                    void chat.end();
                  }}
                >
                  Xác nhận kết thúc
                </button>
              </div>
            </div>
          )}
          <details className="ai-history">
            <summary>
              <History size={14} aria-hidden="true" />
              Lịch sử hội thoại
            </summary>
            {chat.list.isError && (
              <p role="alert">Không tải được lịch sử. Hãy thử tải lại.</p>
            )}
            {chat.list.data?.rows.map((c) => (
              <button
                disabled={chat.busy}
                className="ai-history-item"
                aria-current={c._id === chat.id ? 'true' : undefined}
                key={c._id}
                onClick={() => {
                  setEndTarget(null);
                  chat.select(c._id);
                }}
              >
                {new Date(c.lastActivityAt).toLocaleString('vi-VN')} ·{' '}
                {c.status === 'completed' ? 'Đã kết thúc' : 'Đang mở'}
              </button>
            ))}
            {!chat.list.data?.rows.length && <p>Chưa có hội thoại.</p>}
            <button
              disabled={chat.page <= 1}
              onClick={() => chat.setPage((p) => p - 1)}
            >
              Trước
            </button>
            <span> {chat.page} </span>
            <button
              disabled={chat.page * 10 >= (chat.list.data?.total || 0)}
              onClick={() => chat.setPage((p) => p + 1)}
            >
              Sau
            </button>
          </details>
          <div
            className="ai-messages"
            aria-label="Tin nhắn"
            ref={messagesRef}
            onScroll={(event) => {
              const node = event.currentTarget;
              followLatest.current =
                node.scrollHeight - node.scrollTop - node.clientHeight < 90;
            }}
          >
            {chat.rows.length === 0 && (
              <div className="ai-intro">
                <span className="ai-intro-icon">
                  <Sparkles size={25} aria-hidden="true" />
                </span>{' '}
                <p className="ai-welcome">
                  Xin chào! Tôi có thể giúp gì cho bạn?
                </p>
              </div>
            )}
            {chat.history.isPending && chat.id && (
              <p role="status">Đang tải lịch sử…</p>
            )}
            {chat.history.isError && (
              <p role="alert">Không tải được hội thoại. Vui lòng tải lại.</p>
            )}
            {chat.id && (
              <div className="ai-history-pages">
                <button
                  disabled={
                    chat.busy || (chat.history.data?.rows.length || 0) < 20
                  }
                  onClick={() => chat.setHistoryPage((p) => p + 1)}
                >
                  Tin cũ hơn
                </button>
                <button
                  disabled={chat.busy || chat.historyPage <= 1}
                  onClick={() => chat.setHistoryPage((p) => p - 1)}
                >
                  Tin mới hơn
                </button>
              </div>
            )}
            {chat.rows.map((turn) => (
              <article className="ai-turn" key={turn.requestId}>
                <p className="ai-user">{turn.content}</p>
                <div className="ai-answer-label">
                  <ShoppingBag size={13} aria-hidden="true" /> Trợ lý AI
                </div>
                <p className="ai-answer">
                  {turn.answer ||
                    turn.error?.message ||
                    turnFeedback(turn.status, chat.busy)}
                </p>
                {turn.answer && turn.status !== 'completed' && (
                  <p className="ai-turn-note">
                    {turn.error?.message ||
                      turnFeedback(turn.status, chat.busy)}
                  </p>
                )}
                {turn.sources.map((source) => (
                  <Link className="ai-source" key={source.key} to={source.href}>
                    {source.title} <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                ))}
                <AiProducts products={turn.products || []} />
              </article>
            ))}
            {chat.status && (!chat.busy || chat.status === 'Đang dừng…') && (
              <p className="ai-working" role="status">
                {chat.status}
              </p>
            )}
            {chat.busy &&
              !chat.rows.some((turn) => turn.status === 'processing') && (
                <p className="ai-working">
                  <TypingDots />
                </p>
              )}
            {chat.error && <p role="alert">{chat.error}</p>}
            {completed && (
              <p role="status">
                Hội thoại đã kết thúc. Chọn “Chat mới” để tiếp tục.
              </p>
            )}
          </div>
          <div className="ai-prompts" aria-label="Gợi ý câu hỏi">
            {[
              'Tìm theo ngân sách',
              'Gợi ý sản phẩm',
              'So sánh sản phẩm',
              'Chính sách bảo hành',
            ].map((text) => (
              <button
                disabled={chat.busy || completed || chat.ending}
                key={text}
                onClick={() => send(text)}
              >
                {text}
              </button>
            ))}
          </div>
          <form
            className="ai-composer"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <label className="sr-only" htmlFor="ai-question">
              Câu hỏi cho trợ lý
            </label>
            <textarea
              id="ai-question"
              rows={2}
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  if (!chat.busy && !completed && !chat.ending) send(draft);
                }
              }}
              placeholder="Bạn đang tìm sản phẩm nào?"
              disabled={chat.busy || completed || chat.ending}
            />
            <button
              className="ai-send"
              title="Gửi tin nhắn"
              disabled={chat.busy || completed || chat.ending || !draft.trim()}
              type="submit"
            >
              <Send size={17} aria-hidden="true" />
              <span className="sr-only">Gửi</span>
            </button>
            {chat.busy && (
              <button
                className="ai-stop"
                type="button"
                title="Dừng trả lời"
                onClick={chat.cancel}
              >
                <Square size={14} aria-hidden="true" />
                <span className="sr-only">Dừng</span>
              </button>
            )}
          </form>
          <p className="ai-retention">
            {customer
              ? 'Tin nhắn được xóa sau 30 ngày kể từ lúc gửi.'
              : 'Lịch sử khách được xóa sau 24 giờ kể từ khi kết thúc.'}{' '}
            Hội thoại tự kết thúc sau 1 giờ không hoạt động.
          </p>
        </section>
      )}
    </div>
  );
}

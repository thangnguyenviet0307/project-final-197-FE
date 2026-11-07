import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useChat } from '../hooks/use-chat';
import { AiProducts } from './ai-products';
import './chat-widget.css';
export function ChatWidget() {
  const identity = useAuthStore((s) => s.sessionId);
  const loading = useAuthStore((s) => s.isLoading);
  return loading ? null : <ChatSession key={identity || 'guest'} />;
}
function ChatSession() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const chat = useChat(open);
  const customer = useAuthStore((s) => s.isAuthenticated);
  const completed = chat.history.data?.conversation.status === 'completed';
  const send = (value: string) => {
    if (value.trim()) {
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
          aria-label="Mở trợ lý mua sắm AI"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={23} /> Trợ lý AI
        </button>
      )}
      {open && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="ai-title"
          className="ai-window"
        >
          <header>
            <div>
              <strong id="ai-title">Trợ lý mua sắm AI</strong>
              <small>Tìm sản phẩm phù hợp cùng bạn</small>
            </div>
            <button aria-label="Thu nhỏ trợ lý" onClick={() => setOpen(false)}>
              <X />
            </button>
          </header>
          <nav aria-label="Điều khiển hội thoại">
            <button disabled={chat.busy} onClick={() => chat.select(null)}>
              Chat mới
            </button>
            <button
              disabled={!chat.id || completed || chat.ending}
              onClick={() => {
                if (
                  window.confirm(
                    'Kết thúc hội thoại này? Bạn vẫn có thể xem lịch sử trong thời hạn lưu trữ.'
                  )
                )
                  void chat.end();
              }}
            >
              {chat.ending ? 'Đang kết thúc…' : 'Kết thúc'}
            </button>
            <button
              onClick={() => {
                if (chat.id) void chat.history.refetch();
                void chat.list.refetch();
              }}
            >
              Tải lại
            </button>
          </nav>
          <details>
            <summary>Lịch sử hội thoại</summary>
            {chat.list.isError && (
              <p role="alert">Không tải được lịch sử. Hãy thử tải lại.</p>
            )}
            {chat.list.data?.rows.map((c) => (
              <button
                disabled={chat.busy}
                key={c._id}
                onClick={() => chat.select(c._id)}
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
          <div className="ai-messages" aria-label="Tin nhắn">
            <p className="ai-welcome">
              Xin chào! Tôi có thể giúp bạn tìm, so sánh sản phẩm và xem chính
              sách cửa hàng.
            </p>
            <p className="ai-retention">
              {customer
                ? 'Tin nhắn được xóa sau 30 ngày kể từ lúc gửi.'
                : 'Lịch sử khách được xóa sau 24 giờ kể từ khi kết thúc.'}{' '}
              Hội thoại tự kết thúc sau 1 giờ không hoạt động.
            </p>
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
              <article key={turn.requestId}>
                <p className="ai-user">{turn.content}</p>
                <p className="ai-answer">
                  {turn.answer ||
                    (turn.status === 'processing'
                      ? 'Đang xử lý…'
                      : 'Lượt trả lời chưa hoàn tất.')}
                </p>
                {turn.sources.map((source) => (
                  <Link key={source.key} to={source.href}>
                    {source.title} ↗{' '}
                  </Link>
                ))}
                <AiProducts products={turn.products || []} />
              </article>
            ))}
            {chat.status && <p role="status">{chat.status}</p>}
            {chat.error && <p role="alert">{chat.error}</p>}
            {completed && (
              <p>Hội thoại đã kết thúc. Chọn “Chat mới” để tiếp tục.</p>
            )}
          </div>
          <div className="ai-prompts">
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
              placeholder="Bạn đang tìm sản phẩm nào?"
              disabled={chat.busy || completed || chat.ending}
            />
            <button
              disabled={chat.busy || completed || chat.ending || !draft.trim()}
              type="submit"
            >
              Gửi
            </button>
            {chat.busy && (
              <button type="button" onClick={chat.cancel}>
                Dừng
              </button>
            )}
          </form>
        </section>
      )}
    </div>
  );
}

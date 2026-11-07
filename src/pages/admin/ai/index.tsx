import { useAiAdmin } from '@/features/ai/hooks/use-ai-admin';
import { getApiError } from '@/services/api';
import { Button } from '@/components/ui/button';
export default function AiAdminPage() {
  const { status, reindex } = useAiAdmin();
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Quản trị AI</h1>
      <div className="flex gap-3">
        <Button onClick={() => void status.refetch()}>Tải lại</Button>
        <Button
          disabled={
            reindex.isPending ||
            !status.data?.config.enabled ||
            !status.data?.config.indexingEnabled
          }
          onClick={() => reindex.mutate()}
        >
          {reindex.isPending ? 'Đang xếp lịch…' : 'Đồng bộ kiến thức'}
        </Button>
      </div>
      {reindex.isSuccess && (
        <p role="status">Đã xếp lịch đồng bộ. Tải lại để kiểm tra tiến độ.</p>
      )}
      {reindex.isError && (
        <p role="alert">{getApiError(reindex.error).message}</p>
      )}
      {status.isPending && <p role="status">Đang tải dữ liệu AI…</p>}
      {status.isError && (
        <p role="alert">{getApiError(status.error).message}</p>
      )}
      {status.data && (
        <>
          <dl className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
            <div>
              <dt>Trạng thái</dt>
              <dd>{status.data.config.enabled ? 'Đã bật' : 'Chưa bật'}</dd>
            </div>
            <div>
              <dt>Model trả lời</dt>
              <dd>{status.data.config.model}</dd>
            </div>
            <div>
              <dt>Model embeddings</dt>
              <dd>{status.data.config.embeddingModel}</dd>
            </div>
            <div>
              <dt>Giới hạn lượt gọi / ngày UTC</dt>
              <dd>{status.data.config.dailyCalls}</dd>
            </div>
            <div>
              <dt>Hội thoại còn thời hạn</dt>
              <dd>{status.data.conversations}</dd>
            </div>
            <div>
              <dt>Đoạn kiến thức</dt>
              <dd>{status.data.chunks}</dd>
            </div>
            <div>
              <dt>Đồng bộ tự động</dt>
              <dd>
                {status.data.config.indexingEnabled ? 'Đã bật' : 'Chưa bật'}
              </dd>
            </div>
            <div>
              <dt>Theo dõi rủi ro</dt>
              <dd>{status.data.config.riskEnabled ? 'Đã bật' : 'Chưa bật'}</dd>
            </div>
            <div>
              <dt>Đồng bộ gần nhất</dt>
              <dd>
                {status.data.index?.lastSuccessAt
                  ? new Date(status.data.index.lastSuccessAt).toLocaleString(
                      'vi-VN'
                    )
                  : 'Chưa đồng bộ'}
              </dd>
            </div>
            <div>
              <dt>Trạng thái đồng bộ</dt>
              <dd>
                {status.data.index?.state === 'completed'
                  ? 'Hoàn tất'
                  : status.data.index?.state === 'failed'
                    ? 'Lỗi, sẽ thử lại'
                    : status.data.index
                      ? 'Đang chờ hoặc đang chạy'
                      : 'Chưa lên lịch'}
              </dd>
            </div>
          </dl>
          <p className="text-muted-foreground text-sm">
            Model, ngân sách và bật/tắt AI được cấu hình tại môi trường máy chủ.
            Khóa API không hiển thị trên website.
          </p>
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Lượt gọi nhà cung cấp
            </h2>
            {status.data.usage.length ? (
              status.data.usage.map((u) => (
                <p key={u._id}>
                  {new Date(
                    Number(u._id.split(':').at(-1)) * 86400000
                  ).toLocaleDateString('vi-VN', { timeZone: 'UTC' })}{' '}
                  (UTC): {u.count} lượt
                </p>
              ))
            ) : (
              <p>Chưa có dữ liệu.</p>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Cảnh báo rủi ro theo quy tắc
            </h2>
            <p className="text-muted-foreground mb-3 text-sm">
              Các tín hiệu cần xem xét; hệ thống không tự kết luận gian lận hoặc
              khóa tài khoản.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Sự kiện</th>
                    <th>Lý do</th>
                    <th>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {status.data.risks.map((r) => (
                    <tr key={r._id} className="border-t">
                      <td className="p-2">
                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td>{r.event}</td>
                      <td>{r.reason}</td>
                      <td>{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!status.data.risks.length && <p>Chưa có cảnh báo.</p>}
          </section>
        </>
      )}
    </div>
  );
}

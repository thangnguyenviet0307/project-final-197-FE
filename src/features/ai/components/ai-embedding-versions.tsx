import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Database, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { getApiError } from '@/services/api';
import { aiEmbeddingsService } from '../services/ai-embeddings.service';
import type { AiConnection } from '../types/ai-settings';
import type {
  EmbeddingVersionInput,
  EmbeddingVersionsData,
} from '../types/ai-embeddings';

const models = {
  gemini: ['gemini-embedding-001', 'gemini-embedding-2'],
  openai: ['text-embedding-3-small', 'text-embedding-3-large'],
};
const labels = {
  queued: 'Đang chờ',
  building: 'Đang tạo embeddings',
  verifying: 'Đang xác nhận index',
  ready: 'Sẵn sàng',
  failed: 'Thất bại',
  cancelled: 'Đã hủy',
};
const failureDescriptions: Record<string, string> = {
  AI_INDEX_INTERRUPTED:
    'Tác vụ đã tạm dừng khi máy chủ dừng hoặc khởi động lại. Worker sẽ tự tiếp tục.',
  AI_VECTOR_CAPACITY:
    'Vượt quá 5.000 đoạn kiến thức. Hãy tạo phiên bản dùng Atlas Vector Search.',
  AI_VECTOR_INDEX_PENDING:
    'Đang chờ index tạo xong hoặc dữ liệu được đưa vào index. Worker sẽ kiểm tra lại.',
  AI_VECTOR_INDEX_ERROR:
    'Không tạo hoặc truy vấn được index. Kiểm tra Vector Search, quyền MongoDB và định nghĩa index bên dưới.',
  AI_USAGE_LIMIT:
    'Đã đạt giới hạn gọi API của ứng dụng. Worker giữ tiến độ và tự tiếp tục vào ngày UTC tiếp theo.',
  AI_CREDIT_EXHAUSTED: 'Tài khoản nhà cung cấp không còn hạn mức khả dụng.',
  AI_RATE_LIMITED: 'Nhà cung cấp đang giới hạn yêu cầu. Hãy thử lại sau.',
};
const field =
  'bg-background border-input h-9 w-full rounded-lg border px-3 text-sm';
export function AiEmbeddingVersions({
  connections,
  encryptionReady,
}: {
  connections: AiConnection[];
  encryptionReady: boolean;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['ai', 'admin', 'embeddings'],
    queryFn: aiEmbeddingsService.read,
    refetchInterval: 15000,
  });
  const [draft, setDraft] = useState<EmbeddingVersionInput | null>(null);
  const [confirm, setConfirm] = useState<{
    action: 'activate' | 'legacy' | 'retry' | 'cancel' | 'delete';
    id: string;
    revision: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const data = query.data;
  const eligible = connections.filter(
    (connection) => connection.checkedOk && connection.provider !== 'xai'
  );
  const selected = eligible.find(
    (connection) => connection.id === draft?.connectionId
  );
  const provider = selected?.provider === 'openai' ? 'openai' : 'gemini';
  async function execute(
    work: () => Promise<EmbeddingVersionsData>,
    text: string
  ) {
    if (busy) return false;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await work();
      client.setQueryData(['ai', 'admin', 'embeddings'], result);
      await client.invalidateQueries({ queryKey: ['ai', 'admin'] });
      setMessage(text);
      return true;
    } catch (failure) {
      setError(getApiError(failure).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3 sm:flex-row">
        <div className="space-y-1">
          <CardTitle>Phiên bản embeddings & vector index</CardTitle>
          <CardDescription>
            Đổi nguồn embeddings độc lập với model chat. Chỉ chuyển sang phiên
            bản đã xác nhận truy vấn được; giữ phiên bản cũ để quay lại.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          disabled={
            busy ||
            !encryptionReady ||
            !data ||
            !eligible.length ||
            data.versions.length >= 20
          }
          onClick={() => {
            const connection = eligible[0]!;
            setDraft({
              revision: data!.revision,
              connectionId: connection.id,
              model:
                connection.provider === 'openai'
                  ? models.openai[0]!
                  : models.gemini[0]!,
              dimensions: 1536,
              engine: 'exact',
              startSync: true,
            });
          }}
        >
          <Plus aria-hidden="true" />
          Tạo phiên bản embeddings
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.versions.some((version) =>
          ['queued', 'building', 'verifying'].includes(version.state)
        ) && (
          <div role="status" className="rounded-lg border p-3 text-sm">
            {data.worker?.emergencyDisabled
              ? 'Máy chủ đang bật AI_FORCE_DISABLED. Cần tắt chế độ dừng khẩn cấp để đồng bộ.'
              : data.worker && !data.worker.running
                ? 'Worker đồng bộ chưa chạy trên máy chủ này. Khởi động lại BE bằng pnpm dev hoặc pnpm start sau khi build.'
                : data.worker &&
                    (!data.worker.enabled || !data.worker.indexingEnabled)
                  ? 'Chưa thể đồng bộ: hãy bật trợ lý AI và đồng bộ kiến thức tự động, rồi Lưu vận hành.'
                  : data.worker?.lastErrorCode
                    ? 'Worker chưa xử lý được hàng đợi. Kiểm tra kết nối MongoDB và AI_CONFIG_ENCRYPTION_KEY đang dùng để giải mã các kết nối đã lưu.'
                    : 'Phiên bản đang chờ worker tạo và xác nhận embeddings. Tạo phiên bản chưa bật tìm kiếm ngữ nghĩa; khi Sẵn sàng, hãy chọn Dùng phiên bản này.'}
            {data.worker?.lastTickAt && (
              <p className="text-muted-foreground mt-1 text-xs">
                Worker kiểm tra gần nhất:{' '}
                {new Date(data.worker.lastTickAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        )}
        {query.isPending && <p role="status">Đang tải phiên bản embeddings…</p>}
        {query.isError && (
          <p role="alert" className="text-destructive">
            {getApiError(query.error).message}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-lg border p-3 text-sm">
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="text-destructive rounded-lg border p-3 text-sm"
          >
            {error}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Chọn MongoDB thông thường cho cửa hàng nhỏ (tối đa 5.000 đoạn kiến
          thức), hoặc Atlas Vector Search cho dữ liệu lớn. Worker chạy khi bật
          AI và đồng bộ tự động; tác vụ sử dụng hạn mức embeddings và có thể
          phát sinh phí dịch vụ. xAI chỉ dùng cho chat, không dùng làm nguồn
          embeddings.
        </p>
        {!eligible.length && (
          <p className="text-muted-foreground text-sm">
            Hãy thêm và kiểm tra thành công một kết nối Gemini hoặc OpenAI
            trước.
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Đồng bộ kiểm tra thay đổi mỗi 15 phút, chỉ gọi embeddings cho nội dung
          mới hoặc đã sửa. Tối đa 25% hạn mức ngày dành cho đồng bộ (100
          lượt/ngày tương ứng 25 lượt). Cần hạn mức ít nhất 4 lượt/ngày. Phiên
          bản tự động dùng MongoDB cosine cũ được dọn khi đầy 20 phiên bản, sau
          thời gian bảo vệ 5 phút; phiên bản tạo thủ công được giữ lại.
        </p>
        {data && (
          <>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Database
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
              <span>
                {data.activeId
                  ? `Phiên bản đang dùng: ${data.activeId}`
                  : 'Đang dùng cấu hình embeddings môi trường / tìm kiếm từ khóa'}
              </span>
              {data.activeId && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    setConfirm({
                      action: 'legacy',
                      id: '',
                      revision: data.revision,
                    })
                  }
                >
                  Ngừng dùng phiên bản
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={query.isFetching}
                onClick={() => void query.refetch()}
              >
                Cập nhật phiên bản
              </Button>
            </div>
            {draft && (
              <form
                className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (
                    await execute(
                      () => aiEmbeddingsService.create(draft),
                      'Đã xếp lịch phiên bản mới. Nếu đã chọn bật đồng bộ, worker bắt đầu trong vòng một phút khi AI đang bật. Khi trạng thái Sẵn sàng, chọn Dùng phiên bản này để bật tìm kiếm ngữ nghĩa.'
                    )
                  )
                    setDraft(null);
                }}
              >
                <div className="space-y-2 sm:col-span-3">
                  <Label htmlFor="embedding-engine">
                    Cách tìm kiếm ngữ nghĩa
                  </Label>
                  <select
                    id="embedding-engine"
                    className={field}
                    value={draft.engine ?? 'atlas'}
                    disabled={busy}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        engine: event.target.value as 'exact' | 'atlas',
                      })
                    }
                  >
                    <option value="exact">
                      MongoDB thông thường — cosine, tối đa 5.000 đoạn
                    </option>
                    <option value="atlas">
                      Atlas Vector Search — cần quyền tạo search index
                    </option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.startSync ?? false}
                      disabled={busy}
                      onChange={(event) =>
                        setDraft({ ...draft, startSync: event.target.checked })
                      }
                    />
                    Bật đồng bộ tự động sau khi tạo (cần bật trợ lý AI)
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embedding-connection">
                    Kết nối embeddings
                  </Label>
                  <select
                    id="embedding-connection"
                    required
                    className={field}
                    value={draft.connectionId}
                    disabled={busy}
                    onChange={(event) => {
                      const connection = eligible.find(
                        (item) => item.id === event.target.value
                      )!;
                      setDraft({
                        ...draft,
                        connectionId: connection.id,
                        model:
                          connection.provider === 'openai'
                            ? models.openai[0]!
                            : models.gemini[0]!,
                        dimensions: 1536,
                      });
                    }}
                  >
                    {eligible.map((connection) => (
                      <option key={connection.id} value={connection.id}>
                        {connection.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embedding-model">Model embeddings</Label>
                  <select
                    id="embedding-model"
                    required
                    className={field}
                    disabled={busy}
                    value={draft.model}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        model: event.target.value,
                        dimensions:
                          event.target.value === 'text-embedding-3-small' &&
                          draft.dimensions > 1536
                            ? 1536
                            : draft.dimensions,
                      })
                    }
                  >
                    {models[provider].map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embedding-dimensions">Số chiều vector</Label>
                  <select
                    id="embedding-dimensions"
                    className={field}
                    disabled={busy}
                    value={draft.dimensions}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        dimensions: Number(event.target.value),
                      })
                    }
                  >
                    {[768, 1536, 3072]
                      .filter(
                        (n) =>
                          draft.model !== 'text-embedding-3-small' || n <= 1536
                      )
                      .map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-muted-foreground text-xs sm:col-span-3">
                  Mỗi phiên bản tạo dữ liệu và index riêng trong
                  ai_embedding_chunks, không ghi đè index hiện tại. Tối đa 20
                  phiên bản được lưu.
                </p>
                <div className="flex gap-2 sm:col-span-3">
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Đang tạo…' : 'Xếp lịch đồng bộ phiên bản'}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={busy}
                    onClick={() => setDraft(null)}
                  >
                    Hủy tạo phiên bản
                  </Button>
                </div>
              </form>
            )}
            {confirm && (
              <div
                role="group"
                aria-label="Xác nhận thao tác embeddings"
                className="space-y-3 rounded-lg border p-4"
              >
                <p className="text-sm">
                  {confirm.action === 'activate'
                    ? 'Chuyển các yêu cầu mới sang phiên bản này? Phiên bản hiện tại được giữ lại để quay về.'
                    : confirm.action === 'legacy'
                      ? 'Ngừng dùng phiên bản và tắt tìm kiếm ngữ nghĩa, đồng bộ tự động? Dữ liệu cũ vẫn được giữ.'
                      : confirm.action === 'delete'
                        ? 'Xóa dữ liệu của phiên bản không còn sử dụng? Thao tác này không thể hoàn tác. Search index được giữ để kiểm tra và dọn riêng trên MongoDB.'
                        : confirm.action === 'retry'
                          ? 'Thử lại đồng bộ / xác nhận index? Phần embeddings chưa hoàn tất có thể sử dụng thêm hạn mức API.'
                          : 'Hủy phần công việc còn lại của phiên bản này? Các API call đã bắt đầu vẫn có thể tính vào hạn mức.'}
                </p>
                <div className="flex gap-2">
                  <Button
                    disabled={busy}
                    variant={
                      confirm.action === 'delete' ? 'destructive' : 'default'
                    }
                    onClick={async () => {
                      const value = confirm;
                      const ok = await execute(
                        () =>
                          value.action === 'activate' ||
                          value.action === 'legacy'
                            ? aiEmbeddingsService.activate(
                                value.action === 'legacy' ? null : value.id,
                                value.revision
                              )
                            : aiEmbeddingsService.change(
                                value.id,
                                value.revision,
                                value.action
                              ),
                        'Đã cập nhật phiên bản embeddings.'
                      );
                      if (ok) setConfirm(null);
                    }}
                  >
                    {busy ? 'Đang xử lý…' : 'Xác nhận phiên bản'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setConfirm(null)}
                  >
                    Hủy thao tác phiên bản
                  </Button>
                </div>
              </div>
            )}
            <Table aria-label="Phiên bản embeddings">
              <TableHeader>
                <TableRow>
                  <TableHead>Phiên bản / Model</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đã xác nhận / Tổng đoạn</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.versions.map((version) => (
                  <TableRow key={version._id}>
                    <TableCell>
                      <p className="max-w-64 font-medium break-all">
                        {version.model} · {version.dimensions} chiều
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Kết nối:{' '}
                        {connections.find(
                          (connection) => connection.id === version.connectionId
                        )?.name ?? version.connectionId}
                      </p>
                      <p className="text-muted-foreground mt-1 font-mono text-xs">
                        {version._id}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(version.createdAt).toLocaleString('vi-VN')}
                        {version.autoActivate ? ' · Đồng bộ định kỳ' : ''}
                      </p>
                      {data.activeId === version._id && (
                        <Badge className="mt-2" variant="secondary">
                          Đang sử dụng
                        </Badge>
                      )}
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer">
                          Thông tin vector index
                        </summary>
                        <p className="mt-2 break-all">
                          {version.indexName.startsWith('ai_exact_')
                            ? 'MongoDB cosine (tối đa 5.000 đoạn)'
                            : 'Atlas Vector Search'}{' '}
                          · Collection: {data.collection} · Index:{' '}
                          {version.indexName}
                        </p>
                        <pre className="bg-muted mt-2 max-w-80 overflow-auto rounded p-2">
                          {JSON.stringify(version.indexDefinition, null, 2)}
                        </pre>
                      </details>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          version.state === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {labels[version.state]}
                      </Badge>
                      {version.failureCode && (
                        <p className="text-muted-foreground mt-2 text-xs">
                          {failureDescriptions[version.failureCode] ??
                            'Chưa thể hoàn tất tác vụ. Kiểm tra cấu hình và thử lại.'}{' '}
                          ({version.failureCode})
                        </p>
                      )}
                      {version.failureCode &&
                        version.nextRunAt &&
                        ['queued', 'building', 'verifying'].includes(
                          version.state
                        ) && (
                          <p className="text-muted-foreground mt-2 text-xs">
                            Tự kiểm tra lại:{' '}
                            {new Date(version.nextRunAt).toLocaleString(
                              'vi-VN'
                            )}
                          </p>
                        )}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {version.verified} / {version.chunks}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={
                            busy ||
                            version.state !== 'ready' ||
                            data.activeId === version._id
                          }
                          onClick={() =>
                            setConfirm({
                              action: 'activate',
                              id: version._id,
                              revision: data.revision,
                            })
                          }
                        >
                          Dùng phiên bản này
                        </Button>
                        {data.activeId !== version._id &&
                          (['queued', 'building', 'verifying'].includes(
                            version.state
                          ) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({
                                  action: 'cancel',
                                  id: version._id,
                                  revision: data.revision,
                                })
                              }
                            >
                              Hủy đồng bộ
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  setConfirm({
                                    action: 'retry',
                                    id: version._id,
                                    revision: data.revision,
                                  })
                                }
                              >
                                Thử lại / xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  setConfirm({
                                    action: 'delete',
                                    id: version._id,
                                    revision: data.revision,
                                  })
                                }
                              >
                                Xóa phiên bản
                              </Button>
                            </>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!data.versions.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Chưa có phiên bản embeddings.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
